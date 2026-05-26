import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/services/prisma.service';
import { FxService } from '../fx/fx.service';
import { WalletService } from '../wallet/wallet.service';
import type { RedisClientType } from '@aseanflow/redis';
import { TransferStatus } from '@aseanflow/database';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Prisma } from '@aseanflow/database';
import { TransferEvents } from '../../events/transfer.events';
import { randomBytes } from 'crypto';

const STATUS_ORDER_PHP_TO_IDR: TransferStatus[] = [
  'CREATED',
  'QUOTE_LOCKED',
  'INSTA_PAY_PROCESSING',
  'FX_CONVERSION',
  'BI_FAST_PROCESSING',
  'SETTLED',
  'MORPH_ANCHORED',
];

const STATUS_ORDER_IDR_TO_PHP: TransferStatus[] = [
  'CREATED',
  'QUOTE_LOCKED',
  'BI_FAST_PROCESSING',
  'FX_CONVERSION',
  'INSTA_PAY_PROCESSING',
  'SETTLED',
  'MORPH_ANCHORED',
];

function getStatusOrder(sourceCurrency: string): TransferStatus[] {
  return sourceCurrency === 'IDR'
    ? STATUS_ORDER_IDR_TO_PHP
    : STATUS_ORDER_PHP_TO_IDR;
}

@Injectable()
export class TransferService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fxService: FxService,
    private readonly walletService: WalletService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createTransfer(dto: CreateTransferDto) {
    if (dto.idempotencyKey) {
      const existing = await this.redis.get(
        `transfer:idempotency:${dto.idempotencyKey}`,
      );
      if (existing) {
        return this.getByTrackingCode(existing);
      }
    }

    let walletId: string | null = null;
    if (dto.trackingCode) {
      const existingWallet = await this.walletService.findByTrackingCode(
        dto.trackingCode,
      );
      if (existingWallet) walletId = existingWallet.id;
    }
    if (!walletId) {
      const wallet = await this.walletService.createWallet();
      walletId = wallet.id;
    }

    let rate: number;
    let fee: number;
    let receiveAmount: number;

    if (
      dto.quoteRate != null &&
      dto.quoteFee != null &&
      dto.quoteReceiveAmount != null
    ) {
      rate = dto.quoteRate;
      fee = dto.quoteFee;
      receiveAmount = dto.quoteReceiveAmount;
    } else {
      const quote = await this.fxService.calculateQuote(
        dto.amount,
        dto.from,
        dto.to,
        dto.trackingCode,
      );
      rate = quote.rate;
      fee = quote.fee;
      receiveAmount = quote.receiveAmount;
    }

    // Validate recipient account number for WALLET transfers
    if (dto.recipientType === 'WALLET' && dto.recipientWalletId) {
      const recipient = await this.prisma.user.findUnique({
        where: { accountNumber: dto.recipientWalletId },
      });
      if (!recipient) {
        throw new BadRequestException(
          `Recipient account ${dto.recipientWalletId} not found`,
        );
      }
    }

    const trackingCode = this.generateTrackingCode();

    const transfer = await this.prisma.transfer.create({
      data: {
        trackingCode,
        sourceCurrency: dto.from as 'PHP' | 'IDR',
        targetCurrency: dto.to as 'PHP' | 'IDR',
        sendAmount: new Prisma.Decimal(dto.amount),
        receiveAmount: new Prisma.Decimal(receiveAmount),
        exchangeRate: new Prisma.Decimal(rate),
        fee: new Prisma.Decimal(fee),
        status: 'CREATED',
        walletId,
        recipientType: dto.recipientType as 'WALLET' | 'BANK',
        recipientWalletId: dto.recipientWalletId || null,
        recipientName: dto.recipientName || null,
        recipientBank: dto.recipientBank || null,
        recipientAccount: dto.recipientAccount || null,
        senderId: dto.senderId || null,
      },
    });

    if (dto.idempotencyKey) {
      await this.redis.setEx(
        `transfer:idempotency:${dto.idempotencyKey}`,
        60,
        trackingCode,
      );
    }

    return {
      trackingCode: transfer.trackingCode,
      status: transfer.status,
    };
  }

  async advanceStatus(transferId: string, newStatus: TransferStatus) {
    let oldStatus: TransferStatus;
    const updated = await this.prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: { id: transferId },
      });

      if (!transfer) {
        throw new NotFoundException('Transfer not found');
      }

      oldStatus = transfer.status;
      const statusOrder = getStatusOrder(transfer.sourceCurrency);
      const currentIndex = statusOrder.indexOf(transfer.status);
      const newIndex = statusOrder.indexOf(newStatus);

      if (newIndex !== currentIndex + 1) {
        throw new BadRequestException(
          `Invalid transition: ${transfer.status} → ${newStatus}`,
        );
      }

      return tx.transfer.update({
        where: { id: transferId },
        data: { status: newStatus },
      });
    });

    this.eventEmitter.emit(TransferEvents.STATUS_CHANGED, {
      transferId,
      oldStatus: oldStatus,
      newStatus,
      timestamp: Date.now(),
    });

    return updated;
  }

  async getByTrackingCode(trackingCode: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { trackingCode },
      include: { ledgerEntries: true, rewardWallet: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }

  async getTransfersByUser(userId: string) {
    return this.prisma.transfer.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateTrackingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = randomBytes(9);
    let code = 'TXN';
    for (let i = 0; i < 9; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }
}
