# CLAUDE.md - Database Package

## FEATURE:

**@aseanflow/database** — Prisma ORM v7 package providing type-safe database access for ASEANFlow's Transfer and LedgerEntry models. Uses `prisma-client` generator with `@prisma/adapter-pg` driver adapter, explicit output to `generated/prisma`, and `prisma.config.ts` for configuration. PostgreSQL backend with Prisma Decimal for all monetary fields.

## EXAMPLES:

### Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"       // v7 generator (NOT "prisma-client-js")
  output   = "../generated/prisma" // explicit output required in v7
}

datasource db {
  provider = "postgresql"
}

enum Currency { PHP IDR }
enum TransferStatus {
  CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION
  → BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED
}

model Transfer {
  id, trackingCode (@unique), sourceCurrency, targetCurrency,
  sendAmount (Decimal 18,2), receiveAmount (Decimal 18,2),
  exchangeRate (Decimal 18,6), fee (Decimal 18,2),
  status (TransferStatus), morphTxHash?, instapayRef?, bifastRef?,
  timestamps, ledgerEntries[]
}

model LedgerEntry {
  id, transferId (FK → Transfer, onDelete Cascade),
  debit (Decimal 18,2), credit (Decimal 18,2),
  currency (Currency), createdAt
}
```

### Client Instantiation (v7 pattern)

```typescript
// src/index.ts — imports from generated output
import { PrismaClient } from "../generated/prisma/index.js";

// v7 requires driver adapter for SQL providers
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

### Query Examples (NestJS injection)

```typescript
// Create transfer
const transfer = await prisma.transfer.create({
  data: {
    trackingCode: "AF-" + nanoid(10),
    sourceCurrency: "PHP",
    targetCurrency: "IDR",
    sendAmount: new Prisma.Decimal("1000.00"),    // Decimal, never float
    receiveAmount: new Prisma.Decimal("28000000"),
    exchangeRate: new Prisma.Decimal("28000.000000"),
    fee: new Prisma.Decimal("50.00"),
    status: "CREATED",
  },
});

// Poll by tracking code
const t = await prisma.transfer.findUnique({
  where: { trackingCode },
  include: { ledgerEntries: true },
});
```

## DOCUMENTATION:

- [Prisma v7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrades/to-v7) — breaking changes from v6 → v7
- [Prisma v7 Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference) — generator, datasource, model syntax
- [Prisma Driver Adapters](https://www.prisma.io/docs/orm/core-concepts/supported-databases/database-drivers) — `@prisma/adapter-pg` setup
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference) — query methods
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference) — `prisma.config.ts`
- [Prisma Decimal](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-decimal) — money field handling
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) — database engine

## OTHER CONSIDERATIONS:

### Development Commands (from package root)

| Command | Description |
|---------|-------------|
| `pnpm generate` | Regenerate Prisma client after schema changes |
| `pnpm push` | Push schema to DB without migration (dev) |
| `pnpm migrate` | Create and apply migration (prod) |
| `pnpm studio` | Prisma Studio GUI |
| `pnpm seed` | Run `prisma/seed.ts` via tsx |
| `pnpm build` | TypeScript compilation |
| `pnpm type-check` | `tsc --noEmit` |

### Prisma v7 Specifics (IMPORTANT)

- **Generator**: `provider = "prisma-client"` — NOT `"prisma-client-js"` (legacy)
- **Output**: Must be explicit — `"../generated/prisma"` — v7 no longer auto-places in `node_modules`
- **Driver adapter**: `@prisma/adapter-pg` + `pg` required for PostgreSQL in v7 (was optional in v6)
- **Config file**: `prisma.config.ts` uses `defineConfig()` from `prisma/config` — env loading is manual, NOT automatic
- **Imports**: Client from `../generated/prisma/index.js` — NOT from `@prisma/client` directly
- **Entrypoints**: v7 exposes `client`, `browser`, `models`, `enums` sub-exports from generated output
- **No `Prisma.validator()`**: Use TypeScript `satisfies` operator instead
- **ESM-first**: Package has `"type": "module"` — use `.js` extensions in imports
- **No middleware**: `$use()` removed — use Client Extensions

### Critical Rules

- **Decimal for money**: `Prisma.Decimal` — never `number`, never `float`. Use `new Prisma.Decimal("1000.00")` string constructor.
- **State machine**: TransferStatus is linear, never skip, never reverse: `CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION → BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED`
- **Generate after schema changes**: Always run `pnpm generate` after modifying `schema.prisma`
- **Migration files**: Never edit manually — use `prisma migrate dev`
- **DATABASE_URL**: Must be set in environment — v7 does NOT auto-load `.env`
- **No MongoDB**: Prisma v7 SQL client path does not support MongoDB

### Package Structure

```
packages/database/
├── prisma/
│   ├── schema.prisma      # Database schema (Prisma v7 syntax)
│   ├── seed.ts            # Seed script (tsx runner)
│   └── migrations/        # Migration history
├── generated/
│   └── prisma/            # Generated client (v7 output)
├── src/
│   └── index.ts           # Exports: PrismaClient, Prisma, createPrismaClient()
├── prisma.config.ts       # v7 config: schema path, datasource URL
└── package.json
```

### Key Dependencies

- `@prisma/client@^7.8.0` — Prisma v7 client
- `@prisma/adapter-pg@^7.8.0` — PostgreSQL driver adapter (v7 required)
- `pg@^8.20.0` — Underlying PostgreSQL driver
- `prisma@^7.8.0` — CLI for generate, migrate, studio
- `tsx@^4.0.0` — TypeScript runner for seed scripts
