# CLAUDE.md - Redis Package

## FEATURE:

**@aseanflow/redis** — Redis client wrapper using `redis@^4.6.0` (Node Redis). Provides singleton client management (`createRedisClient`, `getRedisClient`, `closeRedisClient`), generic `Cache` class with TTL and key prefixing, `SessionManager` for user sessions/refresh tokens, and typed `RedisConfig`/`CacheOptions` interfaces. Used by NestJS API for FX rate caching (TTL 30s), idempotency keys, and BullMQ queue backend.

## EXAMPLES:

### Client Initialization

```typescript
import { createRedisClient, getRedisClient, closeRedisClient } from '@aseanflow/redis';

// One-time setup (in main.ts or module init)
await createRedisClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

// Get singleton instance anywhere
const client = getRedisClient();
```

### Cache Usage (FX Rate Caching)

```typescript
import { Cache } from '@aseanflow/redis';

const fxCache = new Cache({ ttl: 30, prefix: 'aseanflow:fx:' });
await fxCache.set('PHP_IDR', { rate: 28000.0, timestamp: Date.now() });
const rate = await fxCache.get<{ rate: number; timestamp: number }>('PHP_IDR');
```

### SessionManager (if auth needed later)

```typescript
import { SessionManager } from '@aseanflow/redis';

const sessions = new SessionManager();
await sessions.createSession(sessionId, { userId, email, role, refreshTokenId, createdAt, expiresAt });
const session = await sessions.getSession(sessionId);
```

## DOCUMENTATION:

- [Node Redis](https://github.com/redis/node-redis) — redis@4.x API reference
- [Redis Commands](https://redis.io/commands/) — Command reference
- [BullMQ Redis Requirements](https://docs.bullmq.io/guide/connections) — Queue backend config

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
packages/redis/
├── src/
│   ├── index.ts          # Barrel exports
│   ├── client.ts         # createRedisClient, getRedisClient, closeRedisClient (singleton)
│   ├── cache.ts          # Cache class: get, set, del, exists, clear with TTL + prefix
│   ├── session.ts        # SessionManager: CRUD sessions + refresh tokens
│   ├── post-cache.ts     # Post-specific caching
│   └── types.ts          # RedisConfig, CacheOptions, CacheKey, CacheValue
└── package.json
```

### Critical Rules

- **FX cache TTL = 30s** — per PRP 02, Redis FX rate cache must expire in 30 seconds
- **Singleton client** — `createRedisClient` creates one client, `getRedisClient` returns it. Never create multiple clients.
- **Key prefix** — default is `webgenix:` (legacy template). Override via `CacheOptions.prefix` to `aseanflow:`. TODO: update default.
- **BullMQ dependency** — BullMQ uses same Redis instance for job queues. Ensure connection is shared.
- **Idempotency keys** — use Redis `SET NX` pattern for transfer deduplication
- **No float in cache values** — serialize `Prisma.Decimal` as string before caching

### Key Dependencies

- `redis@^4.6.0` — Node Redis client
- `@aseanflow/shared@workspace:*` — shared types
- `zod@^3.22.0` — config validation
