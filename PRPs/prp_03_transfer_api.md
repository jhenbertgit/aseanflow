name: "PRP 03 — Transfer API: Quote, Create, Track"
description: |

  ## Purpose

  Build core Transfer API. NestJS controller + service: quote generation, transfer creation w/ tracking code, transfer lookup by tracking code.

  ## Core Principles

  1. **Context is King**: Include ALL docs, examples, caveats
  2. **Validation Loops**: Provide executable tests/lints AI can run + fix
  3. **Information Dense**: Use keywords + patterns from codebase
  4. **Progressive Success**: Start simple, validate, enhance
  5. **Global rules**: Follow all rules in CLAUDE.md

  ---

  ## Goal

  Create NestJS TransferModule w/ controller exposing 3 endpoints: POST /api/quote, POST /api/transfer, GET /api/transfer/:trackingCode. Service handles transfer lifecycle, state machine, tracking code generation.

  ## Why

  - **Core API surface**: 3 endpoints power entire frontend
  - **State machine foundation**: Transfer status transitions must be correct for settlement flow
  - **Tracking code**: Primary user-facing identifier — no login means this IS auth

  ## What

  ### User-visible behavior
  - POST /api/quote → instant FX quote w/ rate, fee, receiveAmount
  - POST /api/transfer → creates transfer, returns tracking code
  - GET /api/transfer/:trackingCode → returns full transfer detail w/ status

  ### Technical requirements
  - NestJS module: TransferModule importing FxModule
  - NestJS controller: TransferController w/ 3 endpoints
  - NestJS service: TransferService w/ createTransfer, advanceStatus, getByTrackingCode
  - State machine: TransferStatus transitions linear, never skip, never go back
  - Idempotency: Redis key `transfer:idempotency:{key}` TTL 60s prevents duplicates
  - Tracking code format: `TXN` + random alphanumeric, 12 chars

  ### Success Criteria

  - [x] POST /api/quote returns { rate, fee, receiveAmount, timestamp }
  - [x] POST /api/transfer creates transfer w/ status CREATED
  - [x] POST /api/transfer returns { trackingCode, status }
  - [x] Tracking code unique, 12+ chars, starts w/ TXN
  - [x] GET /api/transfer/:trackingCode returns full transfer detail
  - [x] State machine never allows skipping or reversing states
  - [x] Idempotency key prevents duplicate transfers
  - [x] DTOs validated w/ class-validator + Zod
  - [x] Domain events emitted on status change

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://docs.nestjs.com/controllers
    why: Route decorators, request validation, response format

  - url: https://docs.nestjs.com/providers#services
    why: Injectable service with Prisma integration

  - doc: packages/shared/src/types/transfer.ts
    why: Existing DTOs and response types from PRP 01
    critical: Use these types, don't duplicate
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  apps/api/src/modules/fx/                   # From PRP 02 — FxModule, FxService
  packages/shared/src/types/transfer.ts      # From PRP 01 — DTOs, types
  packages/database/prisma/schema.prisma     # From PRP 01 — Transfer model
  packages/database/generated/prisma/        # Generated Prisma client
  ```

  ### Desired Codebase tree

  ```txt
  apps/api/src/modules/transfer/
  ├── transfer.module.ts              # NestJS module
  ├── transfer.controller.ts          # 3 API endpoints
  ├── transfer.service.ts             # Transfer lifecycle + state machine
  ├── transfer.service.spec.ts        # Unit tests
  └── dto/
      ├── create-quote.dto.ts         # Quote request validation
      └── create-transfer.dto.ts      # Transfer request validation

  apps/api/src/modules/tracking/
  ├── tracking.module.ts              # Tracking module
  └── tracking.controller.ts          # GET /api/transfer/:trackingCode (or merge into transfer)
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: Transfer state machine — never skip states, never go backwards
  // CRITICAL: Idempotency key in Redis to prevent duplicate transfers
  // CRITICAL: NestJS EventEmitter2 for domain events — NOT Node.js EventEmitter
  // CRITICAL: No authentication — tracking code is the ONLY identifier
  // CRITICAL: Prisma Decimal for money amounts in DB, but API returns numbers
  // CRITICAL: class-validator for NestJS DTOs, Zod for shared validation
  ```

  ## Implementation Blueprint

  ### Data models and structure

  ```typescript
  // DTOs with class-validator
  import { IsNumber, IsString, IsOptional, IsEnum, Min, Max } from 'class-validator';

  export class CreateQuoteDto {
    @IsNumber()
    @Min(1)
    @Max(1000000)
    amount: number;

    @IsEnum(['PHP'])
    from: string;

    @IsEnum(['IDR'])
    to: string;
  }

  export class CreateTransferDto {
    @IsNumber()
    @Min(1)
    amount: number;

    @IsEnum(['PHP'])
    from: string;

    @IsEnum(['IDR'])
    to: string;

    @IsOptional()
    @IsString()
    quoteId?: string;

    @IsOptional()
    @IsString()
    idempotencyKey?: string;
  }
  ```

  ### List of tasks

  ```yaml
  Task 3.1 — Transfer Module:
    CREATE apps/api/src/modules/transfer/transfer.module.ts:
      - REGISTER as NestJS module
      - IMPORT FxModule, PrismaModule (or direct Prisma client)
      - PROVIDE TransferService
      - REGISTER TransferController

  Task 3.2 — Transfer Service:
    CREATE apps/api/src/modules/transfer/transfer.service.ts:
      - INJECT PrismaService, FxService, Redis, EventEmitter2
      - IMPLEMENT createTransfer(dto: CreateTransferDto)
        - CHECK idempotency key in Redis if provided
        - GET quote via FxService.calculateQuote
        - GENERATE tracking code: 'TXN' + 9 random alphanumeric chars
        - PERSIST Transfer with status CREATED, store all amounts
        - SET idempotency key in Redis TTL 60s
        - RETURN { trackingCode, status }
      - IMPLEMENT advanceStatus(transferId: string, newStatus: TransferStatus)
        - VALIDATE transition is linear (next state only)
        - UPDATE transfer status in DB
        - EMIT 'transfer.status.changed' event via EventEmitter2
      - IMPLEMENT getByTrackingCode(trackingCode: string)
        - FIND unique transfer by trackingCode
        - RETURN full detail including all fields
        - THROW NotFoundException if not found

  Task 3.3 — Transfer Controller:
    CREATE apps/api/src/modules/transfer/transfer.controller.ts:
      - POST /api/quote — delegates to FxService.calculateQuote
      - POST /api/transfer — delegates to TransferService.createTransfer
      - GET /api/transfer/:trackingCode — delegates to TransferService.getByTrackingCode

  Task 3.4 — DTOs:
    CREATE apps/api/src/modules/transfer/dto/create-quote.dto.ts
    CREATE apps/api/src/modules/transfer/dto/create-transfer.dto.ts
    - USE class-validator decorators
    - MATCH validation rules from shared Zod schemas

  Task 3.5 — Unit Tests:
    CREATE apps/api/src/modules/transfer/transfer.service.spec.ts:
      - TEST createTransfer generates tracking code
      - TEST createTransfer persists with status CREATED
      - TEST advanceStatus transitions linearly
      - TEST advanceStatus rejects backward transitions
      - TEST getByTrackingCode returns transfer or throws NotFoundException
      - TEST idempotency key prevents duplicates
  ```

  ### Per task pseudocode

  ```typescript
  // Task 3.2 — TransferService
  @Injectable()
  export class TransferService {
    private readonly STATUS_ORDER = [
      'CREATED', 'QUOTE_LOCKED', 'INSTA_PAY_PROCESSING',
      'FX_CONVERSION', 'BI_FAST_PROCESSING', 'SETTLED', 'MORPH_ANCHORED'
    ];

    constructor(
      private prisma: PrismaService,
      private fxService: FxService,
      private redis: Redis,
      private eventEmitter: EventEmitter2,
    ) {}

    async createTransfer(dto: CreateTransferDto) {
      // GOTCHA: Check idempotency BEFORE creating
      if (dto.idempotencyKey) {
        const existing = await this.redis.get(`transfer:idempotency:${dto.idempotencyKey}`);
        if (existing) return this.getByTrackingCode(existing);
      }

      const quote = await this.fxService.calculateQuote(dto.amount, dto.from, dto.to);
      const trackingCode = 'TXN' + randomBytes(5).toString('hex').toUpperCase(); // 13 chars

      const transfer = await this.prisma.transfer.create({
        data: {
          trackingCode,
          sourceCurrency: 'PHP',
          targetCurrency: 'IDR',
          sendAmount: dto.amount,
          receiveAmount: quote.receiveAmount,
          exchangeRate: quote.rate,
          fee: quote.fee,
          status: 'CREATED',
        },
      });

      if (dto.idempotencyKey) {
        await this.redis.set(
          `transfer:idempotency:${dto.idempotencyKey}`,
          trackingCode, 'EX', 60
        );
      }

      return { trackingCode: transfer.trackingCode, status: transfer.status };
    }

    async advanceStatus(transferId: string, newStatus: string) {
      const transfer = await this.prisma.transfer.findUnique({ where: { id: transferId } });
      // CRITICAL: Validate linear transition
      const currentIndex = this.STATUS_ORDER.indexOf(transfer.status);
      const newIndex = this.STATUS_ORDER.indexOf(newStatus);
      if (newIndex !== currentIndex + 1) {
        throw new Error(`Invalid transition: ${transfer.status} → ${newStatus}`);
      }

      await this.prisma.transfer.update({
        where: { id: transferId },
        data: { status: newStatus },
      });

      // PATTERN: Emit event for downstream processors
      this.eventEmitter.emit('transfer.status.changed', { transferId, newStatus });
    }

    async getByTrackingCode(trackingCode: string) {
      const transfer = await this.prisma.transfer.findUnique({
        where: { trackingCode },
        include: { ledgerEntries: true },
      });
      if (!transfer) throw new NotFoundException('Transfer not found');
      return transfer;
    }
  }
  ```

  ### Integration Points

  ```yaml
  REDIS:
    - pattern: "transfer:idempotency:{key} — dedup, TTL 60s"

  ROUTES:
    - add to: apps/api/src/modules/transfer/transfer.controller.ts
    - pattern: "POST /api/quote, POST /api/transfer, GET /api/transfer/:trackingCode"

  EVENTS:
    - emit: "transfer.status.changed — { transferId, newStatus }"
    - consumed by: settlement worker (PRP 05), timeline UI (PRP 09)
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
  describe('TransferService', () => {
    it('creates transfer with tracking code and CREATED status', async () => {
      const result = await service.createTransfer({ amount: 1000, from: 'PHP', to: 'IDR' });
      expect(result.trackingCode).toMatch(/^TXN/);
      expect(result.status).toBe('CREATED');
    });

    it('rejects non-linear status transitions', async () => {
      // CREATED → BI_FAST_PROCESSING should throw
      await expect(service.advanceStatus(id, 'BI_FAST_PROCESSING')).rejects.toThrow();
    });

    it('prevents duplicate transfers with idempotency key', async () => {
      const dto = { amount: 1000, from: 'PHP', to: 'IDR', idempotencyKey: 'test-uuid' };
      const r1 = await service.createTransfer(dto);
      const r2 = await service.createTransfer(dto);
      expect(r1.trackingCode).toBe(r2.trackingCode);
    });

    it('returns transfer by tracking code or throws NotFound', async () => {
      await expect(service.getByTrackingCode('INVALID')).rejects.toThrow(NotFoundException);
    });
  });
  ```

  ```bash
  cd apps/api && pnpm test -- --verbose
  # Expected: All tests pass
  ```

  ### Level 3: Integration Test

  ```bash
  # Start services
  docker-compose -f docker-compose.dev.yml up -d
  pnpm dev

  # Test Quote API
  curl -X POST http://localhost:3001/api/quote \
    -H "Content-Type: application/json" \
    -d '{"amount": 1000, "from": "PHP", "to": "IDR"}'
  # Expected: {"rate": 289.2, "fee": 10, "receiveAmount": 286308, "timestamp": ...}

  # Test Transfer Create
  curl -X POST http://localhost:3001/api/transfer \
    -H "Content-Type: application/json" \
    -d '{"amount": 1000, "from": "PHP", "to": "IDR"}'
  # Expected: {"trackingCode": "TXN...", "status": "CREATED"}

  # Test Tracking
  curl http://localhost:3001/api/transfer/TXN...
  # Expected: Full transfer detail
  ```

  ## Final Validation Checklist

  - [x] All tests pass: `cd apps/api && pnpm test -- --verbose`
  - [x] No linting errors: `pnpm lint`
  - [x] POST /api/quote returns correct quote
  - [x] POST /api/transfer creates w/ tracking code
  - [x] GET /api/transfer/:trackingCode returns detail
  - [x] State machine enforces linear transitions
  - [x] Idempotency prevents duplicates

  ---

  ## Anti-Patterns to Avoid

  - Do NOT skip state machine validation — every transition must be checked
  - Do NOT allow backward state transitions
  - Do NOT create tracking codes shorter than 12 chars
  - Do NOT use float for stored money amounts
  - Do NOT add authentication — tracking code IS identifier
  - Do NOT create microservices — NestJS module only

  ## Dependencies

  - [PRP 01 — Project Setup](./prp_01_project_setup.md) (Prisma schema, shared types)
  - [PRP 02 — FX Engine](./prp_02_fx_engine.md) (FxService for quotes)

  ## Next PRP

  [PRP 04 — Settlement Simulators](./prp_04_settlement.md)