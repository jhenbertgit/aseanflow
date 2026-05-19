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

const STATUS_ORDER: TransferStatus[] = [
  'CREATED',
  'QUOTE_LOCKED',
  'INSTA_PAY_PROCESSING',
  'FX_CONVERSION',
  'BI_FAST_PROCESSING',
  'SETTLED',
  'MORPH_ANCHORED',
];

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

    const quote = await this.fxService.calculateQuote(
      dto.amount,
      dto.from,
      dto.to,
      dto.trackingCode,
    );

    const trackingCode = this.generateTrackingCode();

    const transfer = await this.prisma.transfer.create({
      data: {
        trackingCode,
        sourceCurrency: 'PHP',
        targetCurrency: 'IDR',
        sendAmount: new Prisma.Decimal(dto.amount),
        receiveAmount: new Prisma.Decimal(quote.receiveAmount),
        exchangeRate: new Prisma.Decimal(quote.rate),
        fee: new Prisma.Decimal(quote.fee),
        status: 'CREATED',
        walletId,
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
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    const currentIndex = STATUS_ORDER.indexOf(transfer.status);
    const newIndex = STATUS_ORDER.indexOf(newStatus);

    if (newIndex !== currentIndex + 1) {
      throw new BadRequestException(
        `Invalid transition: ${transfer.status} → ${newStatus}`,
      );
    }

    const updated = await this.prisma.transfer.update({
      where: { id: transferId },
      data: { status: newStatus },
    });

    this.eventEmitter.emit(TransferEvents.STATUS_CHANGED, {
      transferId,
      oldStatus: transfer.status,
      newStatus,
      timestamp: Date.now(),
    });

    return updated;
  }

  async getByTrackingCode(trackingCode: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { trackingCode },
      include: { ledgerEntries: true, wallet: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }

  private generateTrackingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'TXN';
    for (let i = 0; i < 9; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
