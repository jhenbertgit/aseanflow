import { Test } from '@nestjs/testing';
import { LedgerService } from './ledger.service';
import { PrismaService } from '../../common/services/prisma.service';

describe('LedgerService', () => {
  let service: LedgerService;
  let prisma: {
    ledgerEntry: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      ledgerEntry: { create: jest.fn().mockResolvedValue({}) },
    };

    const module = await Test.createTestingModule({
      providers: [LedgerService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
  });

  it('creates debit and credit entries', async () => {
    await service.createEntries('transfer-1', 1000, 286308);

    expect(prisma.ledgerEntry.create).toHaveBeenCalledTimes(2);

    const [debitCall, creditCall] = prisma.ledgerEntry.create.mock.calls;

    expect(debitCall[0].data.transfer.connect).toEqual({
      id: 'transfer-1',
    });
    expect(debitCall[0].data.currency).toBe('PHP');
    expect(String(debitCall[0].data.debit)).toBe('1000');
    expect(String(debitCall[0].data.credit)).toBe('0');

    expect(creditCall[0].data.transfer.connect).toEqual({
      id: 'transfer-1',
    });
    expect(creditCall[0].data.currency).toBe('IDR');
    expect(String(creditCall[0].data.debit)).toBe('0');
    expect(String(creditCall[0].data.credit)).toBe('286308');
  });
});
