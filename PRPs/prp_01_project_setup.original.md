name: "PRP 01 — Project Setup: Prisma Schema, Shared Types, Docker"
description: |

  ## Purpose

  Foundation PRP. Sets up database schema (Transfer, LedgerEntry models), shared TypeScript types/Zod schemas, and Docker Compose for PostgreSQL + Redis. All subsequent PRPs depend on this one.

  ## Core Principles

  1. **Context is King**: Include ALL necessary documentation, examples, and caveats
  2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
  3. **Information Dense**: Use keywords and patterns from the codebase
  4. **Progressive Success**: Start simple, validate, then enhance
  5. **Global rules**: Be sure to follow all rules in CLAUDE.md

  ---

  ## Goal

  Set up the data layer and infrastructure foundation for ASEANFlow. Create Prisma schema with Transfer and LedgerEntry models, shared TypeScript types with Zod validation, and configure Docker Compose for PostgreSQL and Redis.

  ## Why

  - **Foundation for all PRPs**: Every backend module and frontend page depends on these types and database models
  - **Type safety**: Shared types ensure frontend and backend stay in sync
  - **Infrastructure**: PostgreSQL + Redis must be running before any backend code works

  ## What

  ### User-visible behavior
  - None directly — this is infrastructure setup

  ### Technical requirements
  - Prisma schema with Transfer, LedgerEntry, Currency enum, TransferStatus enum
  - Shared types package with Zod schemas for Quote and Transfer DTOs
  - Docker Compose with PostgreSQL and Redis services
  - Prisma client generated and database synced

  ### Success Criteria

  - [ ] Prisma schema has Transfer model with all fields from blueprint
  - [ ] Prisma schema has LedgerEntry model linked to Transfer
  - [ ] Currency enum has PHP and IDR
  - [ ] TransferStatus enum has all 7 states in correct order
  - [ ] `pnpm db:generate` succeeds without errors
  - [ ] `pnpm db:sync` succeeds (Docker running)
  - [ ] Shared types export CreateQuoteSchema, CreateTransferSchema
  - [ ] Shared types export QuoteResponse, TransferResponse, TransferDetailResponse
  - [ ] Docker Compose has postgres and redis services
  - [ ] `docker-compose -f docker-compose.dev.yml up -d` starts cleanly

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://www.prisma.io/docs
    why: Schema definition, client generation, enums, Decimal type

  - url: https://zod.dev
    why: Schema validation for DTOs

  - doc: Prisma Decimal
    section: DecimalPrecision for money fields
    critical: Use @db.DecimalPrecision(18,2) for money, (18,6) for rates — never float
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  packages/database/prisma/schema.prisma    # MODIFY — add models, enums
  packages/shared/src/types/                # CREATE — transfer.ts
  packages/shared/src/schemas/              # CREATE — quote.schema.ts
  packages/shared/src/index.ts              # MODIFY — export new types
  docker-compose.dev.yml                    # VERIFY — postgres + redis configured
  ```

  ### Desired Codebase tree

  ```txt
  packages/database/prisma/schema.prisma    # Transfer, LedgerEntry, Currency, TransferStatus
  packages/shared/src/types/transfer.ts     # Zod schemas + inferred types + response interfaces
  packages/shared/src/schemas/quote.schema.ts  # Quote-specific Zod validation
  packages/shared/src/index.ts              # Re-exports
  docker-compose.dev.yml                    # postgres + redis services
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: Prisma Decimal type — use Decimal for money amounts, never float
  // CRITICAL: TransferStatus enum order matters — state machine progresses linearly
  // CRITICAL: Package namespace is @aseanflow — template mode, not yet initialized
  // CRITICAL: Tailwind v4 uses CSS-based config, not tailwind.config.js
  // CRITICAL: pnpm workspace — packages reference each other via workspace:*
  ```

  ## Implementation Blueprint

  ### Data models and structure

  ```prisma
  // packages/database/prisma/schema.prisma
  // ADD these models and enums (keep existing template models if any)

  model Transfer {
    id               String   @id @default(cuid())
    trackingCode     String   @unique

    sourceCurrency   Currency
    targetCurrency   Currency

    sendAmount       Decimal  @db.DecimalPrecision(18, 2)
    receiveAmount    Decimal  @db.DecimalPrecision(18, 2)
    exchangeRate     Decimal  @db.DecimalPrecision(18, 6)
    fee              Decimal  @db.DecimalPrecision(18, 2)

    status           TransferStatus

    morphTxHash      String?

    instapayRef      String?
    bifastRef        String?

    createdAt        DateTime @default(now())
    updatedAt        DateTime @updatedAt

    ledgerEntries    LedgerEntry[]
  }

  model LedgerEntry {
    id            String   @id @default(cuid())
    transferId    String
    transfer      Transfer @relation(fields: [transferId], references: [id])

    debit         Decimal  @db.DecimalPrecision(18, 2)
    credit        Decimal  @db.DecimalPrecision(18, 2)

    currency      Currency

    createdAt     DateTime @default(now())
  }

  enum Currency {
    PHP
    IDR
  }

  enum TransferStatus {
    CREATED
    QUOTE_LOCKED
    INSTA_PAY_PROCESSING
    FX_CONVERSION
    BI_FAST_PROCESSING
    SETTLED
    MORPH_ANCHORED
  }
  ```

  ```typescript
  // packages/shared/src/types/transfer.ts

  import { z } from 'zod';

  export const CreateQuoteSchema = z.object({
    amount: z.number().positive().max(1000000),
    from: z.enum(['PHP']),
    to: z.enum(['IDR']),
  });

  export const CreateTransferSchema = z.object({
    quoteId: z.string().optional(),
    amount: z.number().positive(),
    from: z.enum(['PHP']),
    to: z.enum(['IDR']),
    idempotencyKey: z.string().uuid().optional(),
  });

  export type CreateQuoteRequest = z.infer<typeof CreateQuoteSchema>;
  export type CreateTransferRequest = z.infer<typeof CreateTransferSchema>;

  export interface QuoteResponse {
    rate: number;
    fee: number;
    receiveAmount: number;
    timestamp: number;
  }

  export interface TransferResponse {
    trackingCode: string;
    status: string;
  }

  export interface TransferDetailResponse {
    trackingCode: string;
    status: string;
    sendAmount: number;
    receiveAmount: number;
    exchangeRate: number;
    fee: number;
    sourceCurrency: string;
    targetCurrency: string;
    morphTxHash: string | null;
    createdAt: string;
    updatedAt: string;
  }
  ```

  ### List of tasks

  ```yaml
  Task 1.1 — Prisma Schema:
    MODIFY packages/database/prisma/schema.prisma:
      - ADD Currency enum (PHP, IDR)
      - ADD TransferStatus enum (CREATED, QUOTE_LOCKED, INSTA_PAY_PROCESSING, FX_CONVERSION, BI_FAST_PROCESSING, SETTLED, MORPH_ANCHORED)
      - ADD Transfer model with all fields from blueprint
      - ADD LedgerEntry model linked to Transfer
      - REMOVE existing template-only models not needed for ASEANFlow
      - KEEP any models needed for auth if present

  Task 1.2 — Shared Types:
    CREATE packages/shared/src/types/transfer.ts:
      - IMPORT z from 'zod'
      - DEFINE CreateQuoteSchema with amount (positive, max 1M), from (PHP), to (IDR)
      - DEFINE CreateTransferSchema with amount, from, to, optional quoteId and idempotencyKey
      - EXPORT inferred types: CreateQuoteRequest, CreateTransferRequest
      - EXPORT interfaces: QuoteResponse, TransferResponse, TransferDetailResponse

    CREATE packages/shared/src/schemas/quote.schema.ts:
      - RE-EXPORT CreateQuoteSchema from types/transfer
      - ADD additional validation helpers if needed

    MODIFY packages/shared/src/index.ts:
      - EXPORT all types and schemas from new files

  Task 1.3 — Docker Compose:
    MODIFY docker-compose.dev.yml:
      - VERIFY postgres service exists with correct port (5432)
      - VERIFY redis service exists with correct port (6379)
      - ENSURE volume mounts for data persistence
      - ENSURE both services on same network

  Task 1.4 — Generate & Sync:
    RUN: pnpm db:generate
    RUN: docker-compose -f docker-compose.dev.yml up -d
    RUN: pnpm db:sync
  ```

  ### Per task pseudocode

  ```typescript
  // Task 1.1 — Prisma Schema
  // PATTERN: Enum values are UPPERCASE, model fields are camelCase
  // GOTCHA: DecimalPrecision(18,2) for money, (18,6) for exchange rate
  // GOTCHA: trackingCode must be @unique — used as public identifier
  // GOTCHA: morphTxHash, instapayRef, bifastRef are optional — populated later

  // Task 1.2 — Shared Types
  // PATTERN: Zod schemas define validation, z.infer generates TypeScript types
  // GOTCHA: from/to are single-value enums for now — expand later for MYR, THB, etc.
  // GOTCHA: idempotencyKey is optional — used to prevent duplicate transfers
  ```

  ### Integration Points

  ```yaml
  DATABASE:
    - migration: "Add Transfer, LedgerEntry models with Currency and TransferStatus enums"
    - index: "CREATE UNIQUE INDEX idx_transfer_tracking ON Transfer(trackingCode)"

  PACKAGES:
    - packages/shared must export all types for apps/api and apps/web to import
    - packages/database generated client must be importable via @aseanflow/database
  ```

  ## Validation Loop

  ### Level 1: Syntax & Style

  ```bash
  pnpm lint                          # ESLint across monorepo
  pnpm format                        # Prettier formatting
  cd apps/web && pnpm typecheck      # TypeScript check frontend
  # Expected: No errors
  ```

  ### Level 2: Generation

  ```bash
  pnpm db:generate                   # Prisma client generation
  # Expected: No errors, client generated to packages/database/generated/prisma

  docker-compose -f docker-compose.dev.yml up -d  # Start postgres + redis
  pnpm db:sync                       # Push schema to database
  # Expected: Schema synced, tables created
  ```

  ### Level 3: Verification

  ```bash
  pnpm db:studio                     # Open Prisma Studio
  # Expected: Can see Transfer and LedgerEntry tables with correct columns
  ```

  ## Final Validation Checklist

  - [ ] Prisma schema compiles: `pnpm db:generate`
  - [ ] Database syncs: `pnpm db:sync`
  - [ ] Shared types importable: no TypeScript errors
  - [ ] Docker services running: `docker-compose -f docker-compose.dev.yml ps`
  - [ ] No linting errors: `pnpm lint`

  ---

  ## Anti-Patterns to Avoid

  - Do NOT use float for money — Prisma Decimal only
  - Do NOT skip DecimalPrecision — specify (18,2) for money, (18,6) for rates
  - Do NOT reorder TransferStatus enum — state machine depends on order
  - Do NOT add authentication models — no login required
  - Do NOT remove existing template models without checking dependencies
  - Do NOT hardcode values that should be config (DB URL, Redis port)

  ## Dependencies

  None — this is the first PRP.

  ## Next PRP

  [PRP 02 — FX Engine](./prp_02_fx_engine.md)
