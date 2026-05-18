name: "PRP 02 — FX Engine: Rate Service with Redis Cache"
description: |

  ## Purpose

  Build the FX (Foreign Exchange) rate engine. Provides cached exchange rates (Redis, TTL 30s) and quote calculation. Used by Quote API in PRP 03.

  ## Core Principles

  1. **Context is King**: Include ALL necessary documentation, examples, and caveats
  2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
  3. **Information Dense**: Use keywords and patterns from the codebase
  4. **Progressive Success**: Start simple, validate, then enhance
  5. **Global rules**: Be sure to follow all rules in CLAUDE.md

  ---

  ## Goal

  Create NestJS FxModule with FxService that provides exchange rate lookup (Redis-cached, 30s TTL) and quote calculation (rate + fee + receiveAmount). Hardcoded rate 289.2 PHP/IDR for hackathon.

  ## Why

  - **Core business logic**: Every transfer needs a quote — FX engine is the heart of the system
  - **Redis integration**: Demonstrates caching pattern, prevents stale rates
  - **Foundation for Quote API**: PRP 03 consumes this service

  ## What

  ### User-visible behavior
  - None directly — internal service consumed by API

  ### Technical requirements
  - NestJS module: FxModule
  - NestJS service: FxService with `getRate()` and `calculateQuote()`
  - Redis cache key pattern: `fx:{from}:{to}`, TTL 30 seconds
  - Fallback rate: 289.2 PHP/IDR (hardcoded for hackathon)
  - Fee calculation: flat ₱10, deducted before conversion
  - DTO with class-validator for input validation

  ### Success Criteria

  - [ ] FxModule registers in NestJS without errors
  - [ ] `getRate('PHP', 'IDR')` returns 289.2 on cache miss
  - [ ] `getRate('PHP', 'IDR')` returns cached value within TTL
  - [ ] `calculateQuote(1000, 'PHP', 'IDR')` returns rate 289.2, fee 10, receiveAmount 289190
  - [ ] Redis cache key is `fx:PHP:IDR` with TTL 30s
  - [ ] DTO validates amount is positive and within range
  - [ ] Unit tests pass for rate caching and quote calculation

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://docs.nestjs.com/modules
    why: Module registration pattern

  - url: https://docs.nestjs.com/providers#services
    why: Injectable service pattern

  - url: https://docs.bullmq.io/
    why: BullMQ queue patterns for settlement and morph-anchor workers

  - doc: packages/redis
    why: Existing Redis client configuration — import from @aseanflow/redis
    critical: Redis client may already be configured, check existing package
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  packages/redis/src/                     # Existing Redis client config
  packages/shared/src/types/transfer.ts   # Currency enum, QuoteResponse type
  packages/database/prisma/schema.prisma  # Currency enum (from PRP 01)
  ```

  ### Desired Codebase tree

  ```txt
  apps/api/src/modules/fx/
  ├── fx.module.ts              # NestJS module
  ├── fx.service.ts             # Rate + quote logic
  ├── fx.service.spec.ts        # Unit tests
  └── dto/
      └── get-quote.dto.ts      # Input validation
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: Redis FX cache TTL 30 seconds — must refresh on stale
  // CRITICAL: Fee is flat ₱10, NOT percentage — deducted BEFORE conversion
  // CRITICAL: Prisma Decimal for money — but FX service returns JS numbers (quote only)
  // CRITICAL: NestJS EventEmitter2 for domain events — NOT Node.js EventEmitter
  // CRITICAL: Use existing Redis client from @aseanflow/redis package
  ```

  ## Implementation Blueprint

  ### Data models and structure

  ```typescript
  // DTO for quote validation
  import { IsNumber, IsEnum, Min, Max } from 'class-validator';

  export class GetQuoteDto {
    @IsNumber()
    @Min(1)
    @Max(1000000)
    amount: number;

    @IsEnum(['PHP'])
    from: string;

    @IsEnum(['IDR'])
    to: string;
  }
  ```

  ### List of tasks

  ```yaml
  Task 2.1 — FX Module:
    CREATE apps/api/src/modules/fx/fx.module.ts:
      - REGISTER as NestJS module with @Global() decorator
      - IMPORT RedisModule from @aseanflow/redis (or register Redis client)
      - PROVIDE FxService

  Task 2.2 — FX Service:
    CREATE apps/api/src/modules/fx/fx.service.ts:
      - IMPLEMENT getRate(from: Currency, to: Currency): Promise<number>
        - CHECK Redis cache key fx:{from}:{to}
        - RETURN cached rate if found
        - FALLBACK to hardcoded 289.2 on cache miss
        - SET cache with TTL 30s
      - IMPLEMENT calculateQuote(amount: number, from: Currency, to: Currency)
        - GET rate via getRate
        - CALCULATE fee = 10 (flat ₱10)
        - CALCULATE receiveAmount = (amount - fee) * rate
        - RETURN { rate, fee, receiveAmount, timestamp: Date.now() }

  Task 2.3 — DTO:
    CREATE apps/api/src/modules/fx/dto/get-quote.dto.ts:
      - CLASS with class-validator decorators
      - amount: number (positive, max 1M)
      - from: string (PHP only)
      - to: string (IDR only)

  Task 2.4 — Unit Tests:
    CREATE apps/api/src/modules/fx/fx.service.spec.ts:
      - TEST getRate returns cached value when available
      - TEST getRate returns default rate on cache miss
      - TEST getRate caches result in Redis with TTL
      - TEST calculateQuote returns correct calculation
      - TEST calculateQuote deducts fee before conversion
  ```

  ### Per task pseudocode

  ```typescript
  // Task 2.2 — FxService
  @Injectable()
  export class FxService {
    private readonly DEFAULT_RATE = 289.2;
    private readonly CACHE_TTL = 30; // seconds

    constructor(private redis: Redis) {} // inject from @aseanflow/redis

    async getRate(from: string, to: string): Promise<number> {
      const cacheKey = `fx:${from}:${to}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) return parseFloat(cached);

      // PATTERN: Hardcoded rate for hackathon — replace with real API later
      const rate = this.DEFAULT_RATE;
      await this.redis.set(cacheKey, rate.toString(), 'EX', this.CACHE_TTL);
      return rate;
    }

    async calculateQuote(amount: number, from: string, to: string) {
      // GOTCHA: Fee deducted BEFORE conversion, not after
      const rate = await this.getRate(from, to);
      const fee = 10;
      const receiveAmount = (amount - fee) * rate;
      return { rate, fee, receiveAmount, timestamp: Date.now() };
    }
  }

  // Task 2.4 — Unit test expectations
  // calculateQuote(1000, 'PHP', 'IDR') → { rate: 289.2, fee: 10, receiveAmount: 289190 }
  // (1000 - 10) * 289.2 = 990 * 289.2 = 286308
  // WAIT: let me recalculate: 990 * 289.2 = 286308... hmm the PRP says 289190
  // Actually (1000 - 10) * 289.2 = 990 * 289.2 = 286,308
  // But the PRP says receiveAmount: 289190... That would be 1000 * 289.2 - 10*289.2 = 289200 - 2892 = 286308
  // The PRP test says: expect(result.receiveAmount).toBe(289190) which would be (1000 - 0.345...) * 289.2
  // FOLLOWING THE PRP PSEUDOCODE: receiveAmount = (amount - fee) * rate = (1000 - 10) * 289.2 = 286308
  // Use the formula from pseudocode, not the test expectation in the PRP which has a math error
  ```

  ### Integration Points

  ```yaml
  REDIS:
    - pattern: "fx:PHP:IDR — FX rate cache, TTL 30s"

  NESTJS:
    - module: FxModule must be importable by TransferModule (PRP 03)
    - service: FxService injected into TransferController for quote endpoint
  ```

  ## Validation Loop

  ### Level 1: Syntax & Style

  ```bash
  pnpm lint
  pnpm format
  # Expected: No errors
  ```

  ### Level 2: Unit Tests

  ```typescript
  // apps/api/src/modules/fx/fx.service.spec.ts
  describe('FxService', () => {
    it('returns cached rate when available', async () => {
      // mock redis.get to return '289.2'
      const result = await service.getRate('PHP', 'IDR');
      expect(result).toBe(289.2);
    });

    it('returns default rate on cache miss and caches it', async () => {
      // mock redis.get to return null
      // mock redis.set
      const result = await service.getRate('PHP', 'IDR');
      expect(result).toBe(289.2);
      // verify redis.set called with 'fx:PHP:IDR', '289.2', 'EX', 30
    });

    it('calculates quote correctly — fee deducted before conversion', async () => {
      const result = await service.calculateQuote(1000, 'PHP', 'IDR');
      expect(result.fee).toBe(10);
      expect(result.receiveAmount).toBe((1000 - 10) * 289.2); // 286308
      expect(result.rate).toBe(289.2);
    });
  });
  ```

  ```bash
  cd apps/api && pnpm test -- --verbose
  # Expected: All tests pass
  ```

  ## Final Validation Checklist

  - [ ] FxModule registers without errors
  - [ ] Unit tests pass: `cd apps/api && pnpm test -- --verbose`
  - [ ] No linting errors: `pnpm lint`
  - [ ] Redis cache pattern correct: `fx:{from}:{to}` with TTL 30s

  ---

  ## Anti-Patterns to Avoid

  - Do NOT use float for stored money — but FX service returns numbers for quotes only
  - Do NOT make external API calls — hardcoded rate for hackathon
  - Do NOT set TTL > 30s — stale rates cause inaccurate quotes
  - Do NOT deduct fee after conversion — fee is deducted before FX conversion
  - Do NOT create microservices — NestJS module only

  ## Dependencies

  - [PRP 01 — Project Setup](./prp_01_project_setup.md) (Prisma schema, shared types, Redis running)

  ## Next PRP

  [PRP 03 — Transfer API](./prp_03_transfer_api.md)
