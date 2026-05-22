# ASEANFlow

> SWIFT-free PHP → IDR cross-border payments. Hackathon MVP.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748.svg)](https://www.prisma.io/)

No SWIFT. No correspondent banks. Direct PHP→IDR via InstaPay + BI-FAST rail simulation with Morph blockchain anchoring for tamper-proof proof.

## Quick Start

```bash
pnpm install
docker compose -f docker-compose.dev.yml up -d   # PostgreSQL + Redis
pnpm db:generate && pnpm db:push                   # Prisma schema → DB
pnpm dev                                           # All apps on :3000 + :3001
```

| App | URL | What |
|-----|-----|------|
| Frontend | http://localhost:3000 | Landing, quote calculator, transfer timeline |
| Backend API | http://localhost:3001 | REST endpoints, settlement simulation |

## How It Works

```
User → POST /api/quote         (FX rate from Redis cache, TTL 30s)
     → POST /api/transfer      (creates transfer, enqueues settlement)
     ← tracking code "AF-abc123"
     → GET /api/transfer/:code (poll for status updates)

Settlement pipeline (simulated, 1-1.5s each step):
  CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION
  → BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED
```

## Key Directories for Reviewers

### `apps/api/src/modules/` — Backend Logic (START HERE)

| Module | Files | Purpose |
|--------|-------|---------|
| **transfer/** | `controller.ts`, `service.ts` | 3 endpoints: quote, create transfer, track. State machine logic. |
| **settlement/** | `service.ts`, `instapay.simulator.ts`, `bifast.simulator.ts` | Pipeline simulation: InstaPay → FX → BI-FAST → Morph anchor |
| **fx/** | `service.ts` | Exchange rate calculation, Redis cache (30s TTL) |
| **ledger/** | `service.ts` | Double-entry bookkeeping (debit/credit per transfer) |
| **morph/** | `service.ts` | SHA-256 proof generation, blockchain anchor simulation |
| **wallet/** | `controller.ts`, `service.ts` | Wallet address management |
| **health/** | `controller.ts` | `/api/health` — postgres + redis status |

### `apps/web/` — Frontend

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Landing page — hero, features, CTAs |
| `app/send/page.tsx` | Quote calculator — PHP→IDR, live rate |
| `app/transfer/[id]/page.tsx` | Animated 7-state timeline, 1s polling |
| `app/rewards/[trackingCode]/` | Reward badge display |
| `app/architecture/page.tsx` | Architecture diagram for judges |
| `components/` | All UI components (timeline, quote, proof, wallet) |

### `apps/worker/src/` — BullMQ Workers

| File | Purpose |
|------|---------|
| `settlement.processor.ts` | Orchestrates the full settlement pipeline |
| `morph-anchor.processor.ts` | Blockchain anchoring (async, non-blocking) |
| `reward-mint.processor.ts` | Reward token minting |

### `packages/database/prisma/` — Data Model

| File | Purpose |
|------|---------|
| `schema.prisma` | Transfer, LedgerEntry, Wallet models. Decimal for money. |

### `packages/shared/src/` — Cross-cutting

Zod schemas, TypeScript types, validation rules shared between frontend and backend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/quote` | Get FX quote: `{ amount, from: "PHP", to: "IDR" }` |
| `POST` | `/api/transfer` | Create transfer → returns `{ trackingCode, status }` |
| `GET` | `/api/transfer/:trackingCode` | Track transfer status + amounts |
| `GET` | `/api/health` | Health check (postgres + redis) |
| `GET` | `/api/wallet/:address` | Get wallet info |

## Transfer State Machine

7 states. Linear. No skip. No reverse.

```
CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION
→ BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED
```

Each simulated rail (InstaPay, BI-FAST) takes 1-1.5s. Morph anchoring is async — never blocks settlement.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | TypeScript 5.9, Node.js 20+, pnpm workspaces |
| Backend | NestJS 10, Prisma v7 (PostgreSQL), Redis 7, BullMQ |
| Frontend | Next.js 16, React 19, Tailwind v4, shadcn/ui, Framer Motion |
| Blockchain | Morph SDK (SHA-256 proof anchoring) |
| Build | Turborepo, Docker Compose |

## Design Decisions

- **No auth/login/KYC** — tracking code is the sole identifier
- **Prisma Decimal for money** — never float
- **Redis FX cache** — 30s TTL, avoids stale rates
- **BullMQ workers** — separate process from API, async settlement
- **Simulators not mocks** — InstaPay/BI-FAST have realistic 1-1.5s delays
- **Morph async** — blockchain anchor never blocks critical path

## Commands

```bash
pnpm dev                  # All apps in watch mode
pnpm build                # Production build (turbo)
pnpm lint                 # Lint all
pnpm test                 # Test all
pnpm db:generate          # Regenerate Prisma client
pnpm db:push              # Push schema changes
pnpm db:seed              # Seed sample data
```

## Monorepo Structure

```
aseanflow/
├── apps/
│   ├── api/          ← NestJS backend (:3001)
│   ├── web/          ← Next.js frontend (:3000)
│   └── worker/       ← BullMQ processors (settlement, morph, rewards)
├── packages/
│   ├── database/     ← Prisma v7 schema + client
│   ├── shared/       ← Zod schemas, TS types
│   ├── ui/           ← shadcn/ui components
│   ├── redis/        ← Redis wrapper (FX cache)
│   ├── eslint-config/
│   ├── tsconfig/
│   └── prettier-config/
├── docker-compose.dev.yml    # PostgreSQL (:5433) + Redis (:6380)
└── turbo.json                # Build pipeline
```

## License

MIT
