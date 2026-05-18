# ASEANFlow — Architecture

SWIFT-free cross-border payment system. Direct PHP → IDR transfers via simulated domestic rails with immutable Morph settlement proofs.

## System Overview

```
User → Next.js (/) → /send → POST /api/quote (FxService, Redis cache TTL 30s)
                    → /send → POST /api/transfer → BullMQ [settlement]
                                                       ↓
User ← /transfer/[code] ← GET /api/transfer/:code ← SettlementService
                                                       ├─ InstaPay simulator (1000-1500ms)
                                                       ├─ FX conversion
                                                       ├─ BI-FAST simulator (1000-1500ms)
                                                       └─ BullMQ [morph-anchor] → MorphService
                                                                                      ↓
User sees ← MORPH_ANCHORED status + proof hash ← anchored on Morph chain
```

## Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | Next.js 16, React 19, Tailwind v4, shadcn/ui, Framer Motion | UI, SSR, animations |
| State | React Query, Zod | Server state, validation |
| Backend | NestJS modular monolith | API, business logic |
| ORM | Prisma | PostgreSQL access, Decimal for money |
| Queue | BullMQ + Redis | Async jobs (settlement, morph anchor) |
| Events | EventEmitter2 | Domain event dispatch |
| Blockchain | Morph SDK | Async proof anchoring (never in critical path) |
| Infra | Docker Compose | web, api, worker, postgres, redis |

## Monorepo Structure

```
apps/
├── web/          # Next.js frontend (:3000)
├── api/          # NestJS API server (:3001)
└── worker/       # BullMQ standalone worker process

packages/
├── ui/           # shadcn/ui shared components
├── database/     # Prisma schema, client, seeds
├── shared/       # Zod schemas, shared types
├── redis/        # Redis client config
├── auth/         # Auth utilities (minimal — no login)
├── eslint-config/
├── tsconfig/
└── prettier-config/
```

## Transfer State Machine

Linear, never skips, never reverses:

```
CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION → BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED
```

| State | Description |
|-------|-------------|
| CREATED | Transfer record created, tracking code assigned |
| QUOTE_LOCKED | FX rate locked from Redis cache |
| INSTA_PAY_PROCESSING | Simulating Philippines InstaPay debit (1000-1500ms) |
| FX_CONVERSION | PHP → IDR conversion at locked rate |
| BI_FAST_PROCESSING | Simulating Indonesia BI-FAST credit (1000-1500ms) |
| SETTLED | Both rails completed, ledger balanced |
| MORPH_ANCHORED | SHA-256 proof anchored on Morph chain (async) |

## Data Models

### Transfer

| Field | Type | Notes |
|-------|------|-------|
| id | String (@id cuid) | Primary key |
| trackingCode | String (@unique) | User-facing identifier — only auth |
| sourceCurrency | Currency (PHP) | Sender currency |
| targetCurrency | Currency (IDR) | Receiver currency |
| sendAmount | Decimal(18,2) | Amount sent |
| receiveAmount | Decimal(18,2) | Amount received |
| exchangeRate | Decimal(18,6) | Locked FX rate |
| fee | Decimal(18,2) | Service fee |
| status | TransferStatus | State machine position |
| morphTxHash | String? | Morph transaction hash |
| instapayRef | String? | InstaPay reference |
| bifastRef | String? | BI-FAST reference |

### LedgerEntry

| Field | Type | Notes |
|-------|------|-------|
| id | String (@id cuid) | Primary key |
| transferId | String (FK) | Linked transfer |
| debit | Decimal(18,2) | Debit amount |
| credit | Decimal(18,2) | Credit amount |
| currency | Currency (PHP/IDR) | Entry currency |

### Enums

```prisma
enum Currency  { PHP IDR }
enum TransferStatus {
  CREATED QUOTE_LOCKED INSTA_PAY_PROCESSING
  FX_CONVERSION BI_FAST_PROCESSING SETTLED MORPH_ANCHORED
}
```

## API Surface

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/quote` | POST | `{ amount, from: "PHP", to: "IDR" }` → `{ rate, fee, receiveAmount, timestamp }` |
| `POST /api/transfer` | POST | `{ amount, from, to }` → `{ trackingCode, status: "CREATED" }` |
| `GET /api/transfer/:trackingCode` | GET | Full transfer detail with current state |
| `GET /api/health` | GET | `{ status, services: { postgres, redis } }` |

## Key Services

### FxService
- Fetches PHP/IDR rate from external API
- Caches in Redis with 30s TTL
- Returns quote with fee calculation

### SettlementService
- Orchestrates end-to-end settlement flow
- Drives transfer through state machine
- InstaPay simulator: 1000-1500ms delay
- BI-FAST simulator: 1000-1500ms delay
- Delegates Morph anchoring to BullMQ queue

### MorphService
- Generates SHA-256 proof of transfer
- Anchors proof on Morph chain via SDK
- Always async — never blocks settlement
- Updates transfer status to MORPH_ANCHORED

### LedgerService
- Double-entry bookkeeping per transfer
- Debit PHP side, credit IDR side
- Uses Prisma Decimal — never float

## BullMQ Workers

Two queues, processed by standalone worker process (`apps/worker`):

| Queue | Job | Flow |
|-------|-----|------|
| `settlement` | Process transfer settlement | InstaPay → FX → BI-FAST → SETTLED |
| `morph-anchor` | Anchor proof on Morph | SHA-256 hash → Morph SDK → MORPH_ANCHORED |

Idempotency key in Redis prevents duplicate transfers.

## Frontend Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page — hero, CTAs, tech badges, Framer Motion |
| `/send` | Quote calculator — PHP input, live IDR quote, React Query |
| `/transfer/[code]` | Transfer timeline — animated 7-state progress, 1s polling, Morph proof |

## Architecture Constraints

- No auth/login/wallet/KYC — tracking code is the only identifier
- No Morph in critical path — always async via BullMQ
- No float for money — Prisma Decimal only
- No skipping transfer states — linear state machine
- BullMQ worker is separate process — not in NestJS
- NestJS EventEmitter2 — not Node.js EventEmitter
- InstaPay/BI-FAST simulators have realistic delays — not instant

## Docker Compose (Production)

```yaml
services:
  web:      # Next.js :3000
  api:      # NestJS :3001
  worker:   # BullMQ worker
  postgres: # PostgreSQL 15
  redis:    # Redis 7
```

All services have health checks. Seed data provides demo-ready transfers.

## Demo Flow (<3 minutes)

1. Landing page — value proposition
2. `/send` — enter PHP amount, see live IDR quote
3. Submit transfer — get tracking code
4. `/transfer/[code]` — watch 7-state timeline animate
5. Final state — MORPH_ANCHORED with on-chain proof hash
