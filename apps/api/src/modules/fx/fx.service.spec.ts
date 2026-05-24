import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';
import { FxService } from './fx.service';
import { WalletService } from '../wallet/wallet.service';

jest.mock('@aseanflow/database', () => ({
  ...jest.requireActual('@aseanflow/database'),
  Prisma: { Decimal },
}));

describe('FxService', () => {
  let service: FxService;
  let redisGet: jest.Mock;
  let redisSetEx: jest.Mock;
  let walletFindByTrackingCode: jest.Mock;
  let walletGetBalance: jest.Mock;

  beforeEach(async () => {
    redisGet = jest.fn();
    redisSetEx = jest.fn();
    walletFindByTrackingCode = jest.fn();
    walletGetBalance = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        FxService,
        {
          provide: 'REDIS_CLIENT',
          useValue: { get: redisGet, setEx: redisSetEx },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultValue?: string) => defaultValue ?? '',
          },
        },
        {
          provide: WalletService,
          useValue: {
            findByTrackingCode: walletFindByTrackingCode,
            getBalance: walletGetBalance,
          },
        },
      ],
    }).compile();

    service = module.get<FxService>(FxService);
  });

  describe('getRate', () => {
    it('returns cached rate when available', async () => {
      redisGet.mockResolvedValue('289.2');

      const result = await service.getRate('PHP', 'IDR');

      expect(result).toBe(289.2);
      expect(redisGet).toHaveBeenCalledWith('fx:PHP:IDR');
      expect(redisSetEx).not.toHaveBeenCalled();
    });

    it('returns default rate on cache miss and caches it', async () => {
      redisGet.mockResolvedValue(null);
      redisSetEx.mockResolvedValue('OK');

      const result = await service.getRate('PHP', 'IDR');

      expect(result).toBe(289.2);
      expect(redisSetEx).toHaveBeenCalledWith('fx:PHP:IDR', 30, '289.2');
    });
  });

  describe('calculateQuote', () => {
    beforeEach(() => {
      redisGet.mockResolvedValue(null);
      redisSetEx.mockResolvedValue('OK');
    });

    it('calculates PHP→IDR quote with fee deducted before conversion', async () => {
      const result = await service.calculateQuote(1000, 'PHP', 'IDR');

      expect(result.rate).toBe(289.2);
      expect(result.fee).toBe(10);
      expect(result.receiveAmount).toBe(286_308);
      expect(result.timestamp).toBeDefined();
    });

    it('returns correct PHP→IDR receiveAmount for different amounts', async () => {
      const result = await service.calculateQuote(500, 'PHP', 'IDR');
      // (500 - 10) * 289.2 = 490 * 289.2 = 141_708
      expect(result.receiveAmount).toBe(141_708);
    });

    it('inverts rate for IDR→PHP using Decimal', async () => {
      const result = await service.calculateQuote(500_000, 'IDR', 'PHP');

      // Inverted rate: 1 / 289.2 ≈ 0.003456...
      expect(result.rate).toBeCloseTo(1 / 289.2, 8);
      // Fee is 10 PHP converted to IDR: 10 * 289.2 = 2892
      expect(result.fee).toBe(2892);
      // receiveAmount = (500000 - 2892) * (1/289.2) ≈ 1716.8...
      expect(result.receiveAmount).toBeCloseTo(
        (500_000 - 2892) * (1 / 289.2),
        4,
      );
    });

    it('always fetches canonical PHP→IDR rate regardless of direction', async () => {
      redisGet.mockResolvedValue('289.2');

      await service.calculateQuote(1000, 'IDR', 'PHP');

      // Should always request the canonical PHP→IDR rate
      expect(redisGet).toHaveBeenCalledWith('fx:PHP:IDR');
    });
  });
});
