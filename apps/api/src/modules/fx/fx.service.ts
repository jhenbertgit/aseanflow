import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RedisClientType } from '@aseanflow/redis';
import { WalletService } from '../wallet/wallet.service';
import { Prisma } from '@aseanflow/database';

interface LiveResponse {
  success: boolean;
  quotes: Record<string, number>;
  error?: { code: number; info: string };
}

@Injectable()
export class FxService {
  private readonly FALLBACK_RATE = 289.2;
  private readonly CACHE_TTL = 30;
  private readonly FALLBACK_CACHE_TTL = 60;
  private readonly logger = new Logger(FxService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    private readonly configService: ConfigService,
    private readonly walletService: WalletService,
  ) {}

  async getRate(from: string, to: string): Promise<number> {
    const cacheKey = `fx:${from}:${to}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return parseFloat(cached);

    const { rate, isFallback } = await this.fetchLiveRate(from, to);
    const ttl = isFallback ? this.FALLBACK_CACHE_TTL : this.CACHE_TTL;
    await this.redis.setEx(cacheKey, ttl, rate.toString());
    return rate;
  }

  private async fetchLiveRate(
    from: string,
    to: string,
  ): Promise<{ rate: number; isFallback: boolean }> {
    const apiKey = this.configService.get<string>('APILAYER_API_KEY');

    if (!apiKey) {
      this.logger.warn('APILAYER_API_KEY not set — using fallback rate');
      return { rate: this.FALLBACK_RATE, isFallback: true };
    }

    try {
      const url = `https://api.apilayer.com/currency_data/live?base=${from}&symbols=${to}`;
      const res = await fetch(url, {
        headers: { apikey: apiKey },
      });

      if (!res.ok) {
        this.logger.warn(
          `APILayer returned ${res.status} — using fallback rate (cached ${this.FALLBACK_CACHE_TTL}s)`,
        );
        return { rate: this.FALLBACK_RATE, isFallback: true };
      }

      const data = (await res.json()) as LiveResponse;

      if (!data.success || !data.quotes) {
        this.logger.warn(
          'APILayer response unsuccessful — using fallback rate',
        );
        return { rate: this.FALLBACK_RATE, isFallback: true };
      }

      const pair = `${from}${to}`;
      const directRate = data.quotes[pair];
      if (directRate && directRate > 0) {
        this.logger.log(`Live ${pair} rate: ${directRate}`);
        return { rate: directRate, isFallback: false };
      }

      // API returns USD-based quotes — cross-calculate if direct pair absent
      const usdFrom = data.quotes[`USD${from}`];
      const usdTo = data.quotes[`USD${to}`];
      if (usdFrom && usdTo && usdFrom > 0) {
        const crossRate = usdTo / usdFrom;
        this.logger.log(
          `Cross-calculated ${pair} rate: ${crossRate} (USD${to}=${usdTo} / USD${from}=${usdFrom})`,
        );
        return { rate: crossRate, isFallback: false };
      }

      this.logger.warn(`No rate data for ${pair} — using fallback rate`);
      return { rate: this.FALLBACK_RATE, isFallback: true };
    } catch (error) {
      this.logger.warn(
        `APILayer fetch failed: ${error instanceof Error ? error.message : String(error)} — using fallback rate`,
      );
      return { rate: this.FALLBACK_RATE, isFallback: true };
    }
  }

  async calculateQuote(
    amount: number,
    from: string,
    to: string,
    trackingCode?: string,
  ) {
    // Always fetch canonical PHP→IDR rate, invert for IDR→PHP
    const canonicalRate = await this.getRate('PHP', 'IDR');

    let rate: Prisma.Decimal;
    if (from === 'IDR' && to === 'PHP') {
      rate = new Prisma.Decimal(1).div(canonicalRate);
    } else {
      rate = new Prisma.Decimal(canonicalRate);
    }

    // Base fee is 10 PHP — convert to source currency for IDR→PHP
    let fee: Prisma.Decimal;
    if (from === 'IDR') {
      fee = new Prisma.Decimal(10).mul(canonicalRate);
    } else {
      fee = new Prisma.Decimal(10);
    }
    let discount: {
      applied: boolean;
      percent: number;
      reason: string;
      threshold?: number;
      balance?: number;
    } = { applied: false, percent: 0, reason: '' };

    if (trackingCode) {
      const wallet = await this.walletService.findByTrackingCode(trackingCode);
      if (wallet) {
        const balance = await this.walletService.getBalance(wallet.address);
        const threshold = parseFloat(
          this.configService.get('REWARD_FEE_DISCOUNT_THRESHOLD', '100'),
        );
        const discountPercent = parseFloat(
          this.configService.get('REWARD_FEE_DISCOUNT_PERCENT', '50'),
        );
        const bal = parseFloat(balance);

        if (bal >= threshold) {
          fee = fee.mul(new Prisma.Decimal(1).minus(discountPercent / 100));
          discount = {
            applied: true,
            percent: discountPercent,
            reason: 'AFT holder discount',
          };
        } else {
          discount = {
            applied: false,
            percent: discountPercent,
            reason: `Hold ${threshold} AFT for ${discountPercent}% fee discount`,
            threshold,
            balance: bal,
          };
        }
      }
    }

    const receiveAmount = new Prisma.Decimal(amount).minus(fee).mul(rate);
    return {
      rate: rate.toNumber(),
      fee: fee.toNumber(),
      receiveAmount: receiveAmount.toNumber(),
      timestamp: Date.now(),
      discount,
    };
  }
}
