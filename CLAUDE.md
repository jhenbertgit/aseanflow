# ASEANFlow

SWIFT-free PHP → IDR cross-border payments. Hackathon MVP. No auth — tracking code = sole identifier.

## Monorepo Structure

```
apps/
  api/      — NestJS 10 backend (:3001)
  web/      — Next.js 16 frontend (:3000)
packages/
  database/ — Prisma v7 ORM (PostgreSQL)
  shared/   — Zod schemas, TS types
  ui/       — shadcn/ui + Radix (React 19)
  redis/    — Redis wrapper (FX cache)
  eslint-config/ — Flat ESLint config
  tsconfig/ — Shared TS configs
  prettier-config/ — Shared Prettier config
```

## Commands

```bash
pnpm install                        # install deps
docker compose -f docker-compose.dev.yml up -d  # postgres + redis
pnpm dev                            # all apps in watch mode
pnpm build                          # production build (turbo)
pnpm lint                           # lint all
pnpm test                           # test all
```

## Stack

- Runtime: Node.js, TypeScript, pnpm workspaces, Turborepo
- Backend: NestJS 10, Prisma v7 (PostgreSQL), Redis 7
- Frontend: Next.js 16, React 19, Tailwind v4, shadcn/ui, Framer Motion, React Query
- No: Firebase, Supabase, MongoDB, tRPC, GraphQL

## Critical Rules

- No auth/login/KYC — tracking code = ONLY identifier
- Prisma Decimal for money — never float
- Transfer state machine: linear 7 states, no skip/reverse
- Package namespace: `@aseanflow`
- Morph/BullMQ/Worker: planned (PRP), not yet implemented

## Environment

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/aseanflow_dev
REDIS_URL=redis://localhost:6380
API_BASE_URL=http://localhost:3001
```
