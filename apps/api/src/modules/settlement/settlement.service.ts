import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { TransferService } from '../transfer/transfer.service';
import { InstapaySimulator } from './instapay.simulator';
import { BifastSimulator } from './bifast.simulator';
import { PrismaService } from '../../common/services/prisma.service';
import { TransferEvents } from '../../events/transfer.events';
import { Prisma } from '@aseanflow/database';

@Injectable()
export class SettlementService {
  constructor(
    private readonly transferService: TransferService,
    private readonly instapay: InstapaySimulator,
    private readonly bifast: BifastSimulator,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject('MORPH_QUEUE') private readonly morphQueue: Queue,
    @Inject('REWARD_MINT_QUEUE') private readonly rewardQueue: Queue,
  ) {}

  async orchestrate(transferId: string): Promise<void> {
    await this.transferService.advanceStatus(transferId, 'QUOTE_LOCKED');

    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    const isIdrToPhp = transfer.sourceCurrency === 'IDR';

    if (isIdrToPhp) {
      const bifastResult = await this.bifast.simulate();
      await this.prisma.transfer.update({
        where: { id: transferId },
        data: { bifastRef: bifastResult.reference },
      });
      await this.transferService.advanceStatus(
        transferId,
        'BI_FAST_PROCESSING',
      );

      await this.transferService.advanceStatus(transferId, 'FX_CONVERSION');

      const instapayResult = await this.instapay.simulate();
      await this.prisma.transfer.update({
        where: { id: transferId },
        data: { instapayRef: instapayResult.reference },
      });
      await this.transferService.advanceStatus(
        transferId,
        'INSTA_PAY_PROCESSING',
      );
    } else {
      const instapayResult = await this.instapay.simulate();
      await this.prisma.transfer.update({
        where: { id: transferId },
        data: { instapayRef: instapayResult.reference },
      });
      await this.transferService.advanceStatus(
        transferId,
        'INSTA_PAY_PROCESSING',
      );

      await this.transferService.advanceStatus(transferId, 'FX_CONVERSION');

      const bifastResult = await this.bifast.simulate();
      await this.prisma.transfer.update({
        where: { id: transferId },
        data: { bifastRef: bifastResult.reference },
      });
      await this.transferService.advanceStatus(
        transferId,
        'BI_FAST_PROCESSING',
      );
    }

    await this.transferService.advanceStatus(transferId, 'SETTLED');

    const settledTransfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
    });

    // Update wallet balances and create ledger entries
    if (settledTransfer) {
      await this.updateWalletBalances(settledTransfer);
    }

    this.eventEmitter.emit(TransferEvents.SETTLED, {
      transferId,
      trackingCode: settledTransfer?.trackingCode ?? transferId,
      timestamp: Date.now(),
    });

    await this.morphQueue.add('anchor', { transferId });
    await this.rewardQueue.add('mint', { transferId });
  }

  private async updateWalletBalances(transfer: {
    id: string;
    senderId: string | null;
    sourceCurrency: 'PHP' | 'IDR';
    targetCurrency: 'PHP' | 'IDR';
    recipientType: 'WALLET' | 'BANK';
    recipientWalletId: string | null;
    sendAmount: Prisma.Decimal;
    receiveAmount: Prisma.Decimal;
    fee: Prisma.Decimal;
  }) {
    await this.prisma.$transaction(async (tx) => {
      // 1. Debit sender's source wallet
      if (transfer.senderId) {
        const totalDebit = transfer.sendAmount.plus(transfer.fee);

        const sourceWallet = await tx.accountWallet.findUnique({
          where: {
            userId_currency: {
              userId: transfer.senderId,
              currency: transfer.sourceCurrency,
            },
          },
        });

        if (sourceWallet) {
          await tx.accountWallet.update({
            where: { id: sourceWallet.id },
            data: { balance: { decrement: totalDebit } },
          });
        }

        await tx.ledgerEntry.create({
          data: {
            transferId: transfer.id,
            debit: totalDebit,
            credit: new Prisma.Decimal(0),
            currency: transfer.sourceCurrency,
          },
        });
      }

      // 2. Credit recipient by account number (WALLET type)
      if (transfer.recipientType === 'WALLET' && transfer.recipientWalletId) {
        const recipientUser = await tx.user.findUnique({
          where: { accountNumber: transfer.recipientWalletId },
        });

        if (recipientUser) {
          await tx.accountWallet.upsert({
            where: {
              userId_currency: {
                userId: recipientUser.id,
                currency: transfer.targetCurrency,
              },
            },
            update: { balance: { increment: transfer.receiveAmount } },
            create: {
              userId: recipientUser.id,
              currency: transfer.targetCurrency,
              balance: transfer.receiveAmount,
            },
          });

          await tx.ledgerEntry.create({
            data: {
              transferId: transfer.id,
              debit: new Prisma.Decimal(0),
              credit: transfer.receiveAmount,
              currency: transfer.targetCurrency,
            },
          });
        }
      }
      // BANK transfers: money leaves the system, no credit to any user
    });
  }
}
