import { Test } from '@nestjs/testing';
import { FxService } from './fx.service';

describe('FxService', () => {
  let service: FxService;
  let redisGet: jest.Mock;
  let redisSetEx: jest.Mock;

  beforeEach(async () => {
    redisGet = jest.fn();
    redisSetEx = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        FxService,
        {
          provide: 'REDIS_CLIENT',
          useValue: { get: redisGet, setEx: redisSetEx },
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

    it('calculates quote with fee deducted before conversion', async () => {
      const result = await service.calculateQuote(1000, 'PHP', 'IDR');

      expect(result.rate).toBe(289.2);
      expect(result.fee).toBe(10);
      expect(result.receiveAmount).toBe(286_308);
      expect(result.timestamp).toBeDefined();
    });

    it('returns correct receiveAmount for different amounts', async () => {
      const result = await service.calculateQuote(500, 'PHP', 'IDR');
      // (500 - 10) * 289.2 = 490 * 289.2 = 141_708
      expect(result.receiveAmount).toBe(141_708);
    });
  });
});
