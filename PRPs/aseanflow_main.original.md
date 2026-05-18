name: "ASEANFlow — Main PRP Index"
description: |

  ## Purpose

  Master index for ASEANFlow PRPs. Lean reference — delegates details to chunk PRPs. AI agents read THIS first, then load only needed chunk.

  ## Core Principles

  1. **Context is King**: Include ALL docs, examples, caveats
  2. **Validation Loops**: Provide executable tests/lints AI can run + fix
  3. **Information Dense**: Use keywords + patterns from codebase
  4. **Progressive Success**: Start simple, validate, enhance
  5. **Global rules**: Follow all rules in CLAUDE.md

  ---

  ## Goal

  Build **ASEANFlow** — SWIFT-free cross-border payment system. Direct PHP → IDR transfers, no USD intermediaries. Simulated domestic rails (InstaPay + BI-FAST), immutable settlement proofs anchored on Morph. Demoable < 3 min. No login, no paywall.

  ## Why

  - Eliminate SWIFT fees + USD conversion overhead for ASEAN cross-border payments
  - Morph integration: immutable settlement proofs, async anchoring, never in critical path
  - Judge value: product understood in <30 seconds

  ## What

  ### User Flow (5 screens)

  1. `/` — Landing: "ASEANFlow — SWIFT-Free ASEAN Payments" → /send or /demo
  2. `/send` — Quote calculator: PHP amount → live IDR quote → "Continue Transfer"
  3. `/transfer/[trackingCode]` — Animated timeline: 7 states, polling 1s, Morph proof on completion
  4. `/demo` — Architecture diagram for technical judges
  5. `GET /api/health` — Service health (postgres, redis)

  ### Tech Stack

  ```yaml
  Frontend: Next.js 16, React 19, Tailwind v4, shadcn/ui, Framer Motion, React Query, Zod
  Backend: NestJS modular monolith, Prisma, PostgreSQL, Redis, BullMQ, EventEmitter2
  Blockchain: Morph SDK (async only, never in critical path)
  Deploy: Docker Compose (web, api, worker, postgres, redis)
  ```

  ### Success Criteria

  - [ ] User can send PHP amount → get instant IDR quote
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

  ## Global Gotchas (apply to ALL PRPs)

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

  ## Anti-Patterns (apply to ALL PRPs)

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

  Each chunk self-contained. Load only chunk you're working on.

  ```yaml
  Phase 1 — Foundation:
    PRP 01: [prp_01_project_setup.md](./prp_01_project_setup.md) ✅ DONE
      scope: Prisma schema (Transfer, LedgerEntry), shared types (Zod), Docker dev
      produces: schema.prisma, transfer.ts types, Docker postgres+redis
      test: pnpm db:generate && pnpm db:sync && pnpm lint

  Phase 2 — API:
    PRP 02: [prp_02_fx_engine.md](./prp_02_fx_engine.md)
      scope: FxService (rate cache, quote calc), Redis cache TTL 30s
      produces: fx.module.ts, fx.service.ts, get-quote.dto.ts
      depends: PRP 01
      test: cd apps/api && pnpm test

    PRP 03: [prp_03_transfer_api.md](./prp_03_transfer_api.md)
      scope: TransferController (3 endpoints), TransferService (state machine, tracking code), idempotency
      produces: transfer.module.ts, transfer.controller.ts, transfer.service.ts, DTOs, tracking module
      depends: PRP 01, PRP 02
      test: cd apps/api && pnpm test && curl POST /api/quote + /api/transfer

  Phase 3 — Settlement + Workers:
    PRP 04: [prp_04_settlement.md](./prp_04_settlement.md)
      scope: InstaPay + BI-FAST simulators, SettlementService orchestrator, LedgerService
      produces: settlement.module.ts, instapay.simulator.ts, bifast.simulator.ts, ledger.module.ts
      depends: PRP 03
      test: cd apps/api && pnpm test

    PRP 05: [prp_05_workers_events.md](./prp_05_workers_events.md)
      scope: BullMQ workers (settlement + morph-anchor), domain events, standalone worker app
      produces: apps/worker/, transfer.events.ts, settlement.worker.ts
      depends: PRP 04
      test: Start worker, create transfer, verify status progresses

  Phase 4 — Morph:
    PRP 06: [prp_06_morph.md](./prp_06_morph.md)
      scope: MorphService (SHA-256 proof, anchorProof), morphTxHash storage, MORPH_ANCHORED status
      produces: morph.module.ts, morph.service.ts
      depends: PRP 05
      test: cd apps/api && pnpm test (deterministic hash)

  Phase 5 — Frontend:
    PRP 07: [prp_07_landing_page.md](./prp_07_landing_page.md)
      scope: / page — hero, CTAs (→/send, →/demo), tech badges, Framer Motion
      produces: apps/web/app/page.tsx
      test: pnpm dev, verify http://localhost:3000

    PRP 08: [prp_08_quote_calculator.md](./prp_08_quote_calculator.md)
      scope: /send page — PHP input, live IDR quote (React Query), "Continue Transfer" → redirect
      produces: apps/web/app/send/page.tsx, quote-calculator.tsx, api clients, hooks
      depends: PRP 02, PRP 03, PRP 07
      test: Enter 1000 PHP → see IDR → click Continue → redirect

    PRP 09: [prp_09_transfer_timeline.md](./prp_09_transfer_timeline.md)
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

  ## Validation Loop (final, after all PRPs)

  ```bash
  # Level 1 — Lint + Type
  pnpm lint
  pnpm format
  cd apps/web && pnpm typecheck

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
  - Morph integration: async proof anchoring
  - Demoable < 3 minutes
  - Technically credible
  - Blockchain NOT in critical path
  - Morph pitch: "Immutable settlement proofs without compromising speed."

  ## Final Pitch

  "We built a SWIFT-free ASEAN payment rail enabling direct PHP-to-IDR transfers through simulated domestic payment systems, real-time FX conversion, and immutable settlement proofs anchored on Morph — without compromising speed or requiring login."

Done. All code blocks, URLs, headings, inline backticks preserved exact. Only natural language prose compressed — dropped articles, filler, merged near-duplicate phrases. File was already dense, so savings modest (~8%).
