import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { Prisma } from '@aseanflow/database';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async createEntries(
    transferId: string,
    sendAmount: number,
    receiveAmount: number,
  ) {
    const debit: Prisma.LedgerEntryCreateInput = {
      transfer: { connect: { id: transferId } },
      debit: new Prisma.Decimal(sendAmount.toString()),
      credit: new Prisma.Decimal(0),
      currency: 'PHP',
    };

    const credit: Prisma.LedgerEntryCreateInput = {
      transfer: { connect: { id: transferId } },
      debit: new Prisma.Decimal(0),
      credit: new Prisma.Decimal(receiveAmount.toString()),
      currency: 'IDR',
    };

    await this.prisma.ledgerEntry.create({ data: debit });
    await this.prisma.ledgerEntry.create({ data: credit });
  }
}
