import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { TransferService } from '../transfer/transfer.service';
import { InstapaySimulator } from './instapay.simulator';
import { BifastSimulator } from './bifast.simulator';
import { PrismaService } from '../../common/services/prisma.service';
import { TransferEvents } from '../../events/transfer.events';

@Injectable()
export class SettlementService {
  constructor(
    private readonly transferService: TransferService,
    private readonly instapay: InstapaySimulator,
    private readonly bifast: BifastSimulator,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject('MORPH_QUEUE') private readonly morphQueue: Queue,
  ) {}

  async orchestrate(transferId: string): Promise<void> {
    await this.transferService.advanceStatus(transferId, 'QUOTE_LOCKED');

    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
    });
    const isIdrToPhp = transfer?.sourceCurrency === 'IDR';

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

    this.eventEmitter.emit(TransferEvents.SETTLED, {
      transferId,
      trackingCode: settledTransfer?.trackingCode ?? '',
      timestamp: Date.now(),
    });

    await this.morphQueue.add('anchor', { transferId });
  }
}
