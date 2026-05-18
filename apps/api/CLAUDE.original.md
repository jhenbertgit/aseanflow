# CLAUDE.md - API Server

## FEATURE:

**@aseanflow/api** — NestJS modular monolith backend for ASEANFlow cross-border PHP → IDR payment system. No auth, no login, no KYC. Tracking code is the only identifier. Provides quote, transfer, settlement, and health endpoints. Integrates with @aseanflow/database (Prisma), Redis (FX rate cache TTL 30s), BullMQ (async settlement + morph anchoring), and Morph SDK (async, never in critical path).

**API Surface:**
- `POST /api/quote` — `{ amount, from: "PHP", to: "IDR" }` → `{ rate, fee, receiveAmount, timestamp }`
- `POST /api/transfer` — `{ amount, from, to }` → `{ trackingCode, status: "CREATED" }`
- `GET /api/transfer/:trackingCode` → TransferDetailResponse (full status + amounts)
- `GET /api/health` — `{ status, services: { postgres, redis } }`

**Transfer State Machine (linear, never skip, never reverse):**
`CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION → BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED`

**Architecture:**
```
User → POST /api/quote (FxService, Redis cache TTL 30s)
     → POST /api/transfer → Queue [settlement]
                                ↓
User ← GET /api/transfer/:code ← SettlementService
                                    ├─ InstaPay simulator (1000-1500ms)
                                    ├─ FX conversion
                                    ├─ BI-FAST simulator (1000-1500ms)
                                    └─ Queue [morph-anchor] → MorphService (async)
```

## EXAMPLES:

Key PRP chunks that define this API (execute in order):

| Phase | PRP | Scope |
|-------|-----|-------|
| 1 | `PRPs/prp_01_project_setup.md` | Prisma schema (Transfer, LedgerEntry), shared Zod types, Docker dev |
| 2 | `PRPs/prp_02_fx_engine.md` | FxService, Redis rate cache TTL 30s, get-quote DTO |
| 2 | `PRPs/prp_03_transfer_api.md` | TransferController (3 endpoints), TransferService (state machine, tracking code), idempotency |
| 3 | `PRPs/prp_04_settlement.md` | InstaPay + BI-FAST simulators, SettlementService, LedgerService |
| 3 | `PRPs/prp_05_workers_events.md` | BullMQ workers (settlement + morph-anchor), domain events, standalone worker app |
| 4 | `PRPs/prp_06_morph.md` | MorphService, SHA-256 proof, anchorProof, MORPH_ANCHORED status |
| 6 | `PRPs/prp_10_demo_docker_polish.md` | Health module, Docker production, seed data |

Implementation patterns:
- **Controller Structure**: RESTful endpoints with class-validator DTOs
- **Service Layer**: Business logic with NestJS dependency injection
- **State Machine**: Linear TransferStatus enum — never skip, never reverse
- **Caching**: Redis FX rate cache, TTL 30s
- **Queue**: BullMQ for settlement + morph anchoring (separate worker process)
- **Money**: Prisma Decimal — never float
- **Events**: NestJS EventEmitter2 — NOT Node.js EventEmitter
- **Simulators**: InstaPay/BI-FAST with 1000-1500ms delay — NOT instant

## DOCUMENTATION:

- [NestJS Docs](https://docs.nestjs.com/) — Modules, Controllers, Services
- [Prisma Docs](https://www.prisma.io/docs) — Schema, queries, Decimal type
- [BullMQ Docs](https://docs.bullmq.io/) — Queue workers, Redis-based
- [Morph SDK](https://docs.morphl2.io/) — Blockchain anchoring
- [Class Validator](https://github.com/typestack/class-validator) — DTO validation decorators
- [Swagger/OpenAPI](https://swagger.io/specification/) — API documentation
- Main PRP: `PRPs/aseanflow_main.md` — master index with dependency graph

## OTHER CONSIDERATIONS:

### Development Commands

```bash
pnpm dev                    # watch mode on :3001
pnpm build                  # production build
pnpm start:prod             # run from dist
pnpm type-check             # tsc --noEmit
pnpm test                   # Jest unit tests
pnpm test:watch             # watch mode
pnpm test:cov               # coverage
pnpm lint / pnpm lint:fix   # ESLint
```

### Critical Rules (violating any = bug)

- Morph MUST NOT be in critical path — always async via BullMQ
- BullMQ requires separate worker process — NOT in NestJS process
- Prisma Decimal for money — never float
- Redis FX cache TTL 30s
- Transfer state machine — linear, never skip, never reverse
- NestJS EventEmitter2 — NOT Node.js EventEmitter
- InstaPay/BI-FAST simulators: 1000-1500ms delay — NOT instant
- Idempotency key in Redis prevents duplicate transfers
- No authentication — tracking code is the ONLY identifier
- Package namespace `@aseanflow`

### Anti-Patterns (never do these)

- No overengineering — hackathon MVP
- No microservices — NestJS modular monolith
- No auth/login/wallet/KYC
- No waiting for Morph confirmations — async via BullMQ
- No faking instant success — realistic simulator delays
- No skipping transfer states — linear state machine
- No float for money — Prisma Decimal only
- No Firebase, Supabase, MongoDB, Zustand, tRPC, GraphQL

### Key Dependencies

- **Core**: @nestjs/core, @nestjs/common, @nestjs/platform-express
- **Queue**: bullmq (in worker process, not API process)
- **Validation**: class-validator, class-transformer
- **Database**: @aseanflow/database (Prisma)
- **Caching**: Redis (FX rate cache)
- **Events**: eventemitter2 (via @nestjs/event-emitter)
- **Docs**: @nestjs/swagger
- **Rate Limiting**: @nestjs/throttler
- **Blockchain**: Morph SDK (async only)

### Data Models

- **Transfer**: id, trackingCode (unique), sourceCurrency, targetCurrency, sendAmount (Decimal 18,2), receiveAmount (Decimal 18,2), exchangeRate (Decimal 18,6), fee (Decimal 18,2), status (TransferStatus enum), morphTxHash?, instapayRef?, bifastRef?, timestamps
- **LedgerEntry**: id, transferId (FK), debit (Decimal 18,2), credit (Decimal 18,2), currency (Currency enum)
- **Currency**: PHP | IDR
- **TransferStatus**: CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION → BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED
