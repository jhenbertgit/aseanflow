name: "ASEANFlow — Main PRP Index"
description: |

  ## Purpose

  Master index ASEANFlow PRPs. Lean reference, details delegated to chunk PRPs. AI reads this first, loads needed chunks only.

  ## Core Principles

  1. **Context is King**: ALL docs, examples, caveats included
  2. **Validation Loops**: Executable tests/lints AI runs + fixes
  3. **Information Dense**: Keywords + patterns from codebase
  4. **Progressive Success**: Simple → validate → enhance
  5. **Global rules**: Follow all rules in CLAUDE.md

  ---

  ## Goal

  Build **ASEANFlow** — SWIFT-free cross-border payments. Direct PHP → IDR, no USD intermediaries. Simulated domestic rails (InstaPay + BI-FAST), immutable settlement proofs on Morph. Demoable < 3 min. No login, no paywall.

  ## Why

  - Eliminate SWIFT fees + USD conversion overhead for ASEAN payments
  - Morph: immutable settlement proofs, async anchoring, never critical path
  - Judge value: product understood < 30s

  ## What

  ### User Flow (5 screens)

  1. `/` — Landing: "ASEANFlow — SWIFT-Free ASEAN Payments" → /send or /demo
  2. `/send` — Quote calculator: PHP → live IDR quote → "Continue Transfer"
  3. `/transfer/[trackingCode]` — Animated timeline: 7 states, 1s polling, Morph proof on completion
  4. `/demo` — Architecture diagram for technical judges
  5. `GET /api/health` — Service health (postgres, redis)

  ### Tech Stack

  ```yaml
  Frontend: Next.js 16, React 19, Tailwind v4, shadcn/ui, Framer Motion, React Query, Zod
  Backend: NestJS modular monolith, Prisma, PostgreSQL, Redis, BullMQ, EventEmitter2
  Blockchain: Morph Hoodi testnet, ethers v6 (async only, never in critical path, mock fallback)
  Deploy: Docker Compose (web, api, worker, postgres, redis)
  ```

  ### Success Criteria

  - [ ] PHP amount → instant IDR quote
  - [ ] Transfer creates tracking code → animated timeline progresses
  - [ ] Settlement completes (~10s) → Morph proof visible
  - [ ] Docker compose runs end-to-end
  - [ ] No login required anywhere
  - [ ] Demo under 3 minutes

  ## Architecture (one-glance)

  ```txt
  User → Next.js (/) → /send → POST /api/quote (FxService, Redis cache)
                      → /send → POST /api/transfer → Queue [settlement]
                                                         ↓
  User ← /transfer/[code] ← GET /api/transfer/:code ← SettlementService
                                                         ├─ InstaPay simulator (1000-1500ms)
                                                         ├─ FX conversion
                                                         ├─ BI-FAST simulator (1000-1500ms)
                                                         └─ Queue [morph-anchor] → MorphService
                                                                                        ↓
  User sees ← MORPH_ANCHORED status + proof hash ← anchored on Morph chain
  ```

  ## Data Models (summary)

  ```yaml
  Transfer: id, trackingCode (unique), sourceCurrency, targetCurrency, sendAmount (Decimal 18,2), receiveAmount (Decimal 18,2), exchangeRate (Decimal 18,6), fee (Decimal 18,2), status (TransferStatus enum), morphTxHash?, instapayRef?, bifastRef?, timestamps
  LedgerEntry: id, transferId (FK), debit (Decimal 18,2), credit (Decimal 18,2), currency (Currency enum)
  Currency: PHP | IDR
  TransferStatus: CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION → BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED
  ```

  ## API Surface

  ```yaml
  POST /api/quote: { amount, from: "PHP", to: "IDR" } → { rate, fee, receiveAmount, timestamp }
  POST /api/transfer: { amount, from, to } → { trackingCode, status: "CREATED" }
  GET /api/transfer/:trackingCode → TransferDetailResponse (full status + amounts)
  GET /api/health → { status, services: { postgres, redis } }
  ```

  ## Global Gotchas (ALL PRPs)

  ```typescript
  // CRITICAL: Morph MUST NOT be in critical path — always async via BullMQ
  // CRITICAL: BullMQ requires separate worker process — NOT in NestJS process
  // CRITICAL: Prisma Decimal for money — never float
  // CRITICAL: Redis FX cache TTL 30s
  // CRITICAL: Transfer state machine — linear, never skip, never reverse
  // CRITICAL: NestJS EventEmitter2 — NOT Node.js EventEmitter
  // CRITICAL: InstaPay/BI-FAST simulators: 1000-1500ms delay — NOT instant
  // CRITICAL: Idempotency key in Redis prevents duplicate transfers
  // CRITICAL: Tailwind v4 uses CSS-based config, not tailwind.config.js
  // CRITICAL: shadcn/ui added via `pnpm dlx shadcn@latest add <component>` from web root
  // CRITICAL: No authentication — tracking code is the ONLY identifier
  // CRITICAL: Package namespace @aseanflow — template mode
  ```

  ## Anti-Patterns (ALL PRPs)

  - No overengineering — hackathon MVP
  - No microservices — NestJS modular monolith
  - No auth/login/wallet/KYC
  - No waiting for Morph confirmations — async via BullMQ
  - No faking instant success — realistic simulator delays
  - No skipping transfer states — linear state machine
  - No float for money — Prisma Decimal only
  - No Firebase, Supabase, MongoDB, Zustand, tRPC, GraphQL

  ---

  ## PRP Chunks (execute in order)

  Each chunk self-contained. Load only needed chunk.

  ```yaml
  Phase 1 — Foundation:
    PRP 01: [prp_01_project_setup.md](./prp_01_project_setup.md) ✅ DONE
      scope: Prisma schema (Transfer, LedgerEntry), shared types (Zod), Docker dev
      produces: schema.prisma, transfer.ts types, Docker postgres+redis
      test: pnpm db:generate && pnpm db:sync && pnpm lint

  Phase 2 — API:
    PRP 02: [prp_02_fx_engine.md](./prp_02_fx_engine.md) ✅ DONE
      scope: FxService (rate cache, quote calc), Redis cache TTL 30s
      produces: fx.module.ts, fx.service.ts, get-quote.dto.ts
      depends: PRP 01
      test: cd apps/api && pnpm test

    PRP 03: [prp_03_transfer_api.md](./prp_03_transfer_api.md) ✅ DONE
      scope: TransferController (3 endpoints), TransferService (state machine, tracking code), idempotency
      produces: transfer.module.ts, transfer.controller.ts, transfer.service.ts, DTOs, tracking module
      depends: PRP 01, PRP 02
      test: cd apps/api && pnpm test && curl POST /api/quote + /api/transfer

  Phase 3 — Settlement + Workers:
    PRP 04: [prp_04_settlement.md](./prp_04_settlement.md) ✅ DONE
      scope: InstaPay + BI-FAST simulators, SettlementService orchestrator, LedgerService
      produces: settlement.module.ts, instapay.simulator.ts, bifast.simulator.ts, ledger.module.ts
      depends: PRP 03
      test: cd apps/api && pnpm test

    PRP 05: [prp_05_workers_events.md](./prp_05_workers_events.md) ✅ DONE
      scope: BullMQ workers (settlement + morph-anchor), domain events, standalone worker app
      produces: apps/worker/, transfer.events.ts, settlement.worker.ts
      depends: PRP 04
      test: Start worker, create transfer, verify status progresses

  Phase 4 — Morph:
    PRP 06: [prp_06_morph.md](./prp_06_morph.md) ✅ DONE
      scope: MorphService (SHA-256 proof, anchorProof), ethers v6 real/mock submission, Morph Hoodi testnet (chain 2910), morphTxHash storage, MORPH_ANCHORED status
      produces: morph.module.ts, morph.service.ts, morph.service.spec.ts (6 tests), morph-anchor.processor.ts (real+mock)
      depends: PRP 05
      test: cd apps/api && npx jest --testPathPattern=morph --verbose

  Phase 5 — Frontend:
    PRP 07: [prp_07_landing_page.md](./prp_07_landing_page.md) ✅ DONE
      scope: / page — hero, CTAs (→/send, →/demo), tech badges, Framer Motion
      produces: apps/web/app/page.tsx
      test: pnpm dev, verify http://localhost:3000

    PRP 08: [prp_08_quote_calculator.md](./prp_08_quote_calculator.md) ✅ DONE
      scope: /send page — PHP input, live IDR quote (React Query), "Continue Transfer" → redirect
      produces: apps/web/app/send/page.tsx, quote-calculator.tsx, api clients, hooks
      depends: PRP 02, PRP 03, PRP 07
      test: Enter 1000 PHP → see IDR → click Continue → redirect

    PRP 09: [prp_09_transfer_timeline.md](./prp_09_transfer_timeline.md) ✅ DONE
      scope: /transfer/[id] page — animated 7-state timeline, 1s polling, Morph proof component
      produces: apps/web/app/transfer/[id]/page.tsx, transfer-timeline.tsx, morph-proof.tsx
      depends: PRP 03, PRP 08
      test: Full flow: send → timeline → morph proof appears

  Phase 6 — Production + Polish:
    PRP 10: [prp_10_demo_docker_polish.md](./prp_10_demo_docker_polish.md)
      scope: /demo architecture page, Docker Compose production, health check, seed data, UI polish
      produces: demo/page.tsx, architecture-diagram.tsx, health module, Dockerfiles, docker-compose.yml, seed.ts
      test: docker-compose up --build, full demo < 3 min
  ```

  ## Dependency Graph

  ```txt
  PRP 01 ──→ PRP 02 ──→ PRP 03 ──→ PRP 04 ──→ PRP 05 ──→ PRP 06
    │                       │                       │
    └──→ PRP 07 ──→ PRP 08 ←┘                       │
                       │                             │
                       └──→ PRP 09 ──────────────────┘
                                                     │
                              PRP 10 ←── (all) ──────┘
  ```

  ## Validation Loop (after all PRPs)

  ```bash
  # Level 1 — Lint + Type
  pnpm lint
  pnpm format
  cd apps/web && pnpm type-check

  # Level 2 — Unit Tests
  cd apps/api && pnpm test -- --verbose

  # Level 3 — Integration (dev)
  docker-compose -f docker-compose.dev.yml up -d
  pnpm dev
  curl -X POST http://localhost:3001/api/quote -H "Content-Type: application/json" -d '{"amount":1000,"from":"PHP","to":"IDR"}'
  curl -X POST http://localhost:3001/api/transfer -H "Content-Type: application/json" -d '{"amount":1000,"from":"PHP","to":"IDR"}'
  # Poll with trackingCode from above

  # Level 4 — Docker Production
  docker-compose up --build
  curl http://localhost:3000              # Frontend
  curl http://localhost:3001/api/health   # Health
  # Full demo flow in browser → < 3 minutes
  ```

  ## Hackathon Constraints

  - No login, no paywall
  - Morph: async proof anchoring
  - Demoable < 3 minutes
  - Technically credible
  - Blockchain NOT in critical path
  - Morph pitch: "Immutable settlement proofs without compromising speed."

  ## Final Pitch

  "SWIFT-free ASEAN payment rail — direct PHP→IDR via simulated domestic rails, real-time FX, immutable Morph settlement proofs. No speed compromise. No login required."

Savings ~12%. File already dense technical spec — most content in code blocks (preserved exact). Compressed: purpose/goal/why prose, success criteria descriptions, hackathon constraints, final pitch.