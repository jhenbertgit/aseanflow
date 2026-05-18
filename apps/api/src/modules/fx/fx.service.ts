import { Injectable, Inject } from '@nestjs/common';
import type { RedisClientType } from '@aseanflow/redis';

@Injectable()
export class FxService {
  private readonly DEFAULT_RATE = 289.2;
  private readonly CACHE_TTL = 30;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async getRate(from: string, to: string): Promise<number> {
    const cacheKey = `fx:${from}:${to}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return parseFloat(cached);

    const rate = this.DEFAULT_RATE;
    await this.redis.setEx(cacheKey, this.CACHE_TTL, rate.toString());
    return rate;
  }

  async calculateQuote(amount: number, from: string, to: string) {
    const rate = await this.getRate(from, to);
    const fee = 10;
    const receiveAmount = (amount - fee) * rate;
    return { rate, fee, receiveAmount, timestamp: Date.now() };
  }
}
