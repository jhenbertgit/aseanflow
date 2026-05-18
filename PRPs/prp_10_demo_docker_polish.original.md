name: "PRP 10 — Architecture Demo, Docker Production, Seed Data, Polish"
description: |

  ## Purpose

  Final polish PRP. Architecture demo page for judges, Docker Compose production config, seed data for demo stability, health check endpoint, and UI polish.

  ## Core Principles

  1. **Context is King**: Include ALL necessary documentation, examples, and caveats
  2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
  3. **Information Dense**: Use keywords and patterns from the codebase
  4. **Progressive Success**: Start simple, validate, then enhance
  5. **Global rules**: Be sure to follow all rules in CLAUDE.md

  ---

  ## Goal

  Create architecture demo page (/demo), production Docker Compose (web, api, worker, postgres, redis), health check endpoint (GET /api/health), seed data with sample completed transfer, and polish all UI animations and responsive layouts.

  ## Why

  - **Judge-facing**: Architecture diagram shows technical depth
  - **Deployable**: Docker Compose makes it one-command demo
  - **Demo stability**: Seed data ensures demo works even if live services hiccup
  - **Health check**: Verifies all services running during demo

  ## What

  ### User-visible behavior
  - /demo page shows architecture diagram with tech stack
  - GET /api/health returns status of postgres, redis, morph
  - Docker Compose runs entire stack with one command
  - Seeded transfer data available for fallback demo

  ### Technical requirements
  - Architecture diagram page: apps/web/app/demo/page.tsx
  - Architecture component: apps/web/components/architecture-diagram.tsx
  - Health module: apps/api/src/modules/health/
  - Docker Compose production: docker-compose.yml
  - Dockerfiles for web, api, worker
  - Seed data: completed transfer with all states
  - UI polish: responsive layout, animation smoothness

  ### Success Criteria

  - [ ] /demo page displays architecture diagram
  - [ ] GET /api/health returns service statuses
  - [ ] docker-compose up --build runs all services
  - [ ] Seed data creates sample completed transfer
  - [ ] All pages responsive on mobile
  - [ ] Animations smooth — no layout shifts
  - [ ] Demo completes under 3 minutes
  - [ ] No console errors on any page

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://docs.docker.com/compose/
    why: Production Docker Compose with multi-service setup

  - url:://nodejs.org/en/docs/guides/dockerizing-nodejs
    why: Dockerfile best practices for Node.js apps

  - url: https://docs.nestjs.com/recipes/terminus
    why: Health check patterns with @nestjs/terminus
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  apps/web/app/page.tsx                    # Links to /demo
  apps/web/app/send/page.tsx               # Send page
  apps/web/app/transfer/[id]/page.tsx      # Timeline page
  packages/database/prisma/seed.ts         # MODIFY — add sample data
  docker-compose.dev.yml                   # Dev config
  ```

  ### Desired Codebase tree

  ```txt
  apps/web/app/demo/page.tsx               # Architecture diagram page
  apps/web/components/architecture-diagram.tsx  # Diagram component
  apps/api/src/modules/health/
  ├── health.module.ts                     # Health module
  └── health.controller.ts                 # GET /api/health
  docker-compose.yml                       # Production Docker Compose
  apps/web/Dockerfile                      # Next.js production build
  apps/api/Dockerfile                      # NestJS production build
  apps/worker/Dockerfile                   # Worker production build
  packages/database/prisma/seed.ts         # Updated with sample data
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: Docker Compose services must wait for postgres to be ready
  // CRITICAL: Next.js Docker build needs standalone output mode
  // CRITICAL: Worker Dockerfile needs same deps as API
  // CRITICAL: Seed data should include a MORPH_ANCHORED transfer for demo fallback
  // CRITICAL: Health check should test actual DB + Redis connections, not just process alive
  ```

  ## Implementation Blueprint

  ### List of tasks

  ```yaml
  Task 10.1 — Architecture Demo Page:
    CREATE apps/web/app/demo/page.tsx:
      - DISPLAY high-level architecture diagram
      - SHOW: User → Next.js → NestJS → [InstaPay, BI-FAST, Redis, PostgreSQL, Morph]
      - SHOW tech stack badges with descriptions
      - FOR technical judges only — keep clean and informative
      - USE Framer Motion for diagram animations

    CREATE apps/web/components/architecture-diagram.tsx:
      - VISUAL representation of system architecture
      - CAN be SVG, CSS-based, or text diagram
      - HIGHLIGHT: SWIFT-free path, async Morph anchoring
      - SHOW data flow: PHP → InstaPay → FX → BI-FAST → IDR → Morph proof

  Task 10.2 — Health Check:
    CREATE apps/api/src/modules/health/health.module.ts:
      - REGISTER HealthModule

    CREATE apps/api/src/modules/health/health.controller.ts:
      - GET /api/health
      - CHECK postgres connection (Prisma query)
      - CHECK redis connection (PING)
      - CHECK morph connection (optional — may skip if unreliable)
      - RETURN { status: 'ok', services: { postgres: 'up', redis: 'up', morph: 'up' } }

  Task 10.3 — Seed Data:
    MODIFY packages/database/prisma/seed.ts:
      - ADD sample completed transfer:
        - status: MORPH_ANCHORED
        - sendAmount: 5000 PHP
        - receiveAmount: calculated based on rate
        - exchangeRate: 289.2
        - fee: 10
        - trackingCode: 'TXNDEMO001'
        - morphTxHash: mock hash
        - instapayRef: 'IPS' + mock
        - bifastRef: 'BIF' + mock
      - ADD corresponding ledger entries (debit PHP, credit IDR)
      - ENSURE demo works even without live services

  Task 10.4 — Docker Production:
    CREATE docker-compose.yml:
      - SERVICES:
        - web: Next.js (port 3000)
        - api: NestJS (port 3001)
        - worker: BullMQ worker
        - postgres: PostgreSQL (port 5432)
        - redis: Redis (port 6379)
      - NETWORKS: internal communication
      - VOLUMES: postgres data, redis data
      - DEPENDS_ON with health checks

    CREATE apps/web/Dockerfile:
      - MULTI-STAGE build: deps → build → production
      - NEXT_STANDALONE output mode
      - EXPOSE 3000

    CREATE apps/api/Dockerfile:
      - MULTI-STAGE build: deps → build → production
      - EXPOSE 3001

    CREATE apps/worker/Dockerfile:
      - MULTI-STAGE build (similar to API)
      - RUN node dist/main.js

  Task 10.5 — UI Polish:
    - REVIEW all pages for responsive layout
    - CHECK animation smoothness (no layout shifts)
    - ADD loading states where missing
    - ADD error boundaries
    - VERIFY full demo flow under 3 minutes
  ```

  ### Per task pseudocode

  ```typescript
  // Task 10.2 — Health Check
  @Controller('api/health')
  export class HealthController {
    constructor(
      private prisma: PrismaService,
      private redis: Redis,
    ) {}

    @Get()
    async check() {
      const [pgOk, redisOk] = await Promise.allSettled([
        this.prisma.$queryRaw`SELECT 1`,
        this.redis.ping(),
      ]);

      return {
        status: pgOk.status === 'fulfilled' && redisOk.status === 'fulfilled' ? 'ok' : 'degraded',
        services: {
          postgres: pgOk.status === 'fulfilled' ? 'up' : 'down',
          redis: redisOk.status === 'fulfilled' ? 'up' : 'down',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Task 10.3 — Seed data
  // packages/database/prisma/seed.ts
  async function seedDemoTransfer(prisma: PrismaClient) {
    const transfer = await prisma.transfer.upsert({
      where: { trackingCode: 'TXNDEMO001' },
      update: {},
      create: {
        trackingCode: 'TXNDEMO001',
        sourceCurrency: 'PHP',
        targetCurrency: 'IDR',
        sendAmount: 5000,
        receiveAmount: 1445480, // (5000 - 10) * 289.2
        exchangeRate: 289.2,
        fee: 10,
        status: 'MORPH_ANCHORED',
        morphTxHash: '0x' + 'a'.repeat(64), // mock hash
        instapayRef: 'IPS' + 'DEMO1234',
        bifastRef: 'BIF' + 'DEMO5678',
      },
    });

    await prisma.ledgerEntry.createMany({
      data: [
        { transferId: transfer.id, debit: 5000, credit: 0, currency: 'PHP' },
        { transferId: transfer.id, debit: 0, credit: 1445480, currency: 'IDR' },
      ],
    });
  }

  // Task 10.4 — Docker Compose (key sections)
  // docker-compose.yml
  services:
    web:
      build: ./apps/web
      ports: ["3000:3000"]
      depends_on:
        api: { condition: service_healthy }

    api:
      build: ./apps/api
      ports: ["3001:3001"]
      depends_on:
        postgres: { condition: service_healthy }
        redis: { condition: service_healthy }
      environment:
        - DATABASE_URL=postgresql://...
        - REDIS_HOST=redis

    worker:
      build: ./apps/worker
      depends_on:
        redis: { condition: service_healthy }

    postgres:
      image: postgres:16-alpine
      volumes: [pgdata:/var/lib/postgresql/data]
      healthcheck:
        test: ["CMD-SHELL", "pg_isready"]

    redis:
      image: redis:7-alpine
      volumes: [redisdata:/data]
      healthcheck:
        test: ["CMD", "redis-cli", "ping"]
  ```

  ### Integration Points

  ```yaml
  ROUTES:
    - /demo → architecture page
    - GET /api/health → service status

  DOCKER:
    - networks: all services on same network
    - volumes: postgres + redis data persistence
    - healthchecks: postgres (pg_isready), redis (redis-cli ping)

  SEED:
    - trackingCode: TXNDEMO001 — visit /transfer/TXNDEMO001 to see completed transfer
  ```

  ## Validation Loop

  ### Level 1: Syntax & Style

  ```bash
  pnpm lint
  pnpm format
  cd apps/web && pnpm typecheck
  # Expected: No errors
  ```

  ### Level 2: Health Check

  ```bash
  pnpm dev
  curl http://localhost:3001/api/health
  # Expected: {"status":"ok","services":{"postgres":"up","redis":"up"}}
  ```

  ### Level 3: Seed Data

  ```bash
  pnpm db:seed
  curl http://localhost:3001/api/transfer/TXNDEMO001
  # Expected: Full transfer detail with MORPH_ANCHORED status
  ```

  ### Level 4: Docker End-to-End

  ```bash
  docker-compose up --build
  # Wait for all services healthy
  curl http://localhost:3000              # Next.js frontend
  curl http://localhost:3001/api/health   # Health check
  # Run full demo flow through browser
  # Expected: Complete in under 3 minutes
  ```

  ## Final Validation Checklist

  - [ ] All tests pass: `cd apps/api && pnpm test -- --verbose`
  - [ ] No linting errors: `pnpm lint`
  - [ ] TypeScript clean: `cd apps/web && pnpm typecheck`
  - [ ] Health check returns service statuses
  - [ ] Seed data creates demo transfer
  - [ ] Docker Compose builds and runs all services
  - [ ] Full demo flow completes under 3 minutes
  - [ ] No login required anywhere
  - [ ] Error cases handled (invalid amount, missing tracking code)
  - [ ] Animations smooth — no layout shifts
  - [ ] All pages responsive

  ---

  ## Anti-Patterns to Avoid

  - Do NOT use dev Dockerfiles for production — multi-stage builds
  - Do NOT skip healthchecks in Docker Compose — services must wait for deps
  - Do NOT forget standalone output mode for Next.js Docker
  - Do NOT seed real-looking data that could confuse — clearly mark as demo
  - Do NOT over-polish animations — subtle is better than flashy

  ## Dependencies

  - All previous PRPs (01-09) must be complete

  ## This is the final PRP.
