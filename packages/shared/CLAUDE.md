# CLAUDE.md - Shared Package

## FEATURE:

**@aseanflow/shared** — Zod schemas, TS types, pure utils shared across frontend (Next.js) and backend (NestJS). Single source of truth for API contracts: `CreateQuoteSchema`, `CreateTransferSchema`, `QuoteResponse`, `TransferDetailResponse`. No side effects, no framework deps — only `zod`.

## EXAMPLES:

### Zod Schemas (`src/schemas/`)

```typescript
// quote.schema.ts — API request/response validation
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
```

### Types (`src/types/`)

```typescript
// transfer.ts — inferred from Zod + response interfaces
export type CreateQuoteRequest = z.infer<typeof CreateQuoteSchema>;
export type CreateTransferRequest = z.infer<typeof CreateTransferSchema>;

export interface QuoteResponse {
  rate: number; fee: number; receiveAmount: number; timestamp: number;
}
export interface TransferDetailResponse {
  trackingCode: string; status: string;
  sendAmount: number; receiveAmount: number; exchangeRate: number; fee: number;
  sourceCurrency: string; targetCurrency: string;
  morphTxHash: string | null; createdAt: string; updatedAt: string;
}
```

### Usage Patterns

```typescript
// Backend: NestJS DTO validation
import { CreateQuoteSchema } from '@aseanflow/shared';
const parsed = CreateQuoteSchema.parse(body);

// Frontend: React Query + form validation
import { CreateQuoteSchema, type QuoteResponse } from '@aseanflow/shared';
```

## DOCUMENTATION:

- [Zod](https://zod.dev/) — Schema validation and type inference
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) — Advanced type patterns
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## OTHER CONSIDERATIONS:

### Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | TypeScript compilation |
| `pnpm dev` | TypeScript watch mode |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm test` | Jest unit tests |

### Package Structure

```
packages/shared/
├── src/
│   ├── index.ts              # Barrel exports
│   ├── schemas/
│   │   ├── quote.schema.ts   # CreateQuoteSchema, CreateTransferSchema
│   │   ├── common.schemas.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── transfer.ts       # QuoteResponse, TransferDetailResponse, TransferResponse
│   │   ├── api.types.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── errors.ts
│   │   ├── pagination.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── slug.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   └── __tests__/
│       └── utils.test.ts
└── package.json
```

### Critical Rules

- **Pure functions only** — no side effects, no state, no framework deps
- **No circular imports** — never import from other workspace packages
- **Zod schemas are the contract** — frontend and backend both derive types from same schemas
- **No float for money** — response interfaces use `number` but backend must use `Prisma.Decimal` internally
- **No over-engineering** — hackathon MVP, only add schemas/types used by ASEANFlow transfer flow
- **Zod version**: `^3.23.8` — ensure consuming packages match

### Key Dependencies

- `zod@^3.23.8` — schema validation + type inference (only runtime dep)
- `jest` + `ts-jest` — testing