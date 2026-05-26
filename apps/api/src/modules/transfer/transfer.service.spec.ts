import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import { TransferService } from './transfer.service';
import { FxService } from '../fx/fx.service';
import { PrismaService } from '../../common/services/prisma.service';
import { WalletService } from '../wallet/wallet.service';

jest.mock('@aseanflow/database', () => ({
  ...jest.requireActual('@aseanflow/database'),
  Prisma: { Decimal },
  TransferStatus: {
    CREATED: 'CREATED',
    QUOTE_LOCKED: 'QUOTE_LOCKED',
    INSTA_PAY_PROCESSING: 'INSTA_PAY_PROCESSING',
    FX_CONVERSION: 'FX_CONVERSION',
    BI_FAST_PROCESSING: 'BI_FAST_PROCESSING',
    SETTLED: 'SETTLED',
    MORPH_ANCHORED: 'MORPH_ANCHORED',
  },
  Currency: { PHP: 'PHP', IDR: 'IDR' },
}));

describe('TransferService', () => {
  let service: TransferService;
  let prismaTransferMock: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  let prisma: {
    transfer: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let fxService: { calculateQuote: jest.Mock };
  let redis: { get: jest.Mock; setEx: jest.Mock };
  let eventEmitter: { emit: jest.Mock };
  let walletService: { findByTrackingCode: jest.Mock; createWallet: jest.Mock };

  beforeEach(async () => {
    prismaTransferMock = {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    };
    prisma = {
      transfer: prismaTransferMock,
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-1', accountNumber: 'wallet-1' }),
      },
      $transaction: jest.fn((cb) => cb({ transfer: prismaTransferMock })),
    };
    fxService = { calculateQuote: jest.fn() };
    redis = { get: jest.fn(), setEx: jest.fn() };
    eventEmitter = { emit: jest.fn() };
    walletService = {
      findByTrackingCode: jest.fn().mockResolvedValue(null),
      createWallet: jest.fn().mockResolvedValue({ id: 'wallet-1' }),
    };

    const module = await Test.createTestingModule({
      providers: [
        TransferService,
        { provide: PrismaService, useValue: prisma },
        { provide: FxService, useValue: fxService },
        { provide: 'REDIS_CLIENT', useValue: redis },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: WalletService, useValue: walletService },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
  });

  describe('createTransfer', () => {
    const quote = {
      rate: 289.2,
      fee: 10,
      receiveAmount: 286308,
      timestamp: Date.now(),
    };
    const mockTransfer = {
      id: 'test-id',
      trackingCode: 'TXNABC123DEF',
      status: 'CREATED',
    };

    it('creates PHP→IDR transfer with tracking code and CREATED status', async () => {
      fxService.calculateQuote.mockResolvedValue(quote);
      prisma.transfer.create.mockResolvedValue(mockTransfer);

      const result = await service.createTransfer({
        amount: 1000,
        from: 'PHP',
        to: 'IDR',
        recipientType: 'WALLET',
        recipientWalletId: 'wallet-1',
      });

      expect(result.trackingCode).toMatch(/^TXN/);
      expect(result.status).toBe('CREATED');
      expect(prisma.transfer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CREATED',
            sourceCurrency: 'PHP',
            targetCurrency: 'IDR',
          }),
        }),
      );
    });

    it('creates IDR→PHP transfer with correct currencies', async () => {
      const idrToPhpQuote = {
        rate: 0.003456,
        fee: 10,
        receiveAmount: 1726.8,
        timestamp: Date.now(),
      };
      fxService.calculateQuote.mockResolvedValue(idrToPhpQuote);
      prisma.transfer.create.mockResolvedValue(mockTransfer);

      const result = await service.createTransfer({
        amount: 500_000,
        from: 'IDR',
        to: 'PHP',
        recipientType: 'WALLET',
        recipientWalletId: 'wallet-1',
      });

      expect(result.trackingCode).toMatch(/^TXN/);
      expect(result.status).toBe('CREATED');
      expect(prisma.transfer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CREATED',
            sourceCurrency: 'IDR',
            targetCurrency: 'PHP',
          }),
        }),
      );
    });

    it('prevents duplicate transfers with idempotency key', async () => {
      redis.get.mockResolvedValue('TXNEXISTING123');
      prisma.transfer.findUnique.mockResolvedValue({
        trackingCode: 'TXNEXISTING123',
        status: 'CREATED',
        ledgerEntries: [],
      });

      const dto = {
        amount: 1000,
        from: 'PHP',
        to: 'IDR',
        idempotencyKey: 'test-uuid',
        recipientType: 'WALLET' as const,
      };
      const result = await service.createTransfer(dto);

      expect(result.trackingCode).toBe('TXNEXISTING123');
      expect(prisma.transfer.create).not.toHaveBeenCalled();
    });

    it('stores idempotency key in Redis after creation', async () => {
      redis.get.mockResolvedValue(null);
      fxService.calculateQuote.mockResolvedValue(quote);
      prisma.transfer.create.mockResolvedValue(mockTransfer);

      await service.createTransfer({
        amount: 1000,
        from: 'PHP',
        to: 'IDR',
        idempotencyKey: 'test-uuid',
        recipientType: 'WALLET',
        recipientWalletId: 'wallet-1',
      });

      expect(redis.setEx).toHaveBeenCalledWith(
        'transfer:idempotency:test-uuid',
        60,
        expect.stringMatching(/^TXN/),
      );
    });
  });

  describe('advanceStatus', () => {
    it('advances to next linear state', async () => {
      prisma.transfer.findUnique.mockResolvedValue({
        id: 't1',
        status: 'CREATED',
        sourceCurrency: 'PHP',
      });
      prisma.transfer.update.mockResolvedValue({
        id: 't1',
        status: 'QUOTE_LOCKED',
      });

      const result = await service.advanceStatus('t1', 'QUOTE_LOCKED');

      expect(result.status).toBe('QUOTE_LOCKED');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'transfer.status.changed',
        expect.objectContaining({
          transferId: 't1',
          oldStatus: 'CREATED',
          newStatus: 'QUOTE_LOCKED',
        }),
      );
    });

    it('rejects skipping states', async () => {
      prisma.transfer.findUnique.mockResolvedValue({
        id: 't1',
        status: 'CREATED',
        sourceCurrency: 'PHP',
      });

      await expect(
        service.advanceStatus('t1', 'BI_FAST_PROCESSING'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects backward transitions', async () => {
      prisma.transfer.findUnique.mockResolvedValue({
        id: 't1',
        status: 'FX_CONVERSION',
        sourceCurrency: 'PHP',
      });

      await expect(service.advanceStatus('t1', 'CREATED')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects same-state transition', async () => {
      prisma.transfer.findUnique.mockResolvedValue({
        id: 't1',
        status: 'CREATED',
        sourceCurrency: 'PHP',
      });

      await expect(service.advanceStatus('t1', 'CREATED')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException for missing transfer', async () => {
      prisma.transfer.findUnique.mockResolvedValue(null);

      await expect(
        service.advanceStatus('missing', 'QUOTE_LOCKED'),
      ).rejects.toThrow(NotFoundException);
    });

    it('allows BI-FAST before InstaPay for IDR→PHP', async () => {
      prisma.transfer.findUnique.mockResolvedValue({
        id: 't1',
        status: 'QUOTE_LOCKED',
        sourceCurrency: 'IDR',
      });
      prisma.transfer.update.mockResolvedValue({
        id: 't1',
        status: 'BI_FAST_PROCESSING',
      });

      const result = await service.advanceStatus('t1', 'BI_FAST_PROCESSING');

      expect(result.status).toBe('BI_FAST_PROCESSING');
    });

    it('rejects InstaPay after QUOTE_LOCKED for IDR→PHP', async () => {
      prisma.transfer.findUnique.mockResolvedValue({
        id: 't1',
        status: 'QUOTE_LOCKED',
        sourceCurrency: 'IDR',
      });

      await expect(
        service.advanceStatus('t1', 'INSTA_PAY_PROCESSING'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getByTrackingCode', () => {
    it('returns transfer with ledger entries', async () => {
      const mockTransfer = {
        trackingCode: 'TXNABC123DEF',
        status: 'CREATED',
        ledgerEntries: [],
      };
      prisma.transfer.findUnique.mockResolvedValue(mockTransfer);

      const result = await service.getByTrackingCode('TXNABC123DEF');

      expect(result.trackingCode).toBe('TXNABC123DEF');
      expect(prisma.transfer.findUnique).toHaveBeenCalledWith({
        where: { trackingCode: 'TXNABC123DEF' },
        include: { ledgerEntries: true, rewardWallet: true },
      });
    });

    it('throws NotFoundException for invalid code', async () => {
      prisma.transfer.findUnique.mockResolvedValue(null);

      await expect(service.getByTrackingCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
