# Auto User Creation on First Dashboard Visit

## Problem

Users are hardcoded in `seed.ts`. The system needs dynamic user creation — when a new visitor opens the dashboard for the first time, a complete user account (with credentials, wallets) is created automatically via a cookie-based flow.

## Design

### Flow

1. Visitor hits `/send` (dashboard page)
2. Frontend checks `af_session` cookie
3. **No cookie** → generate random UUID token → set cookie → call `POST /api/users/init` with `{ cookieToken }`
4. API creates: User + PHP wallet + IDR wallet (zero balances)
5. Return full user data → dashboard renders
6. **Returning visitor** → cookie exists → `GET /api/dashboard/:cookieToken` as today

### Generated User Fields

| Field | Format | Example |
|-------|--------|---------|
| cookieToken | UUID v4 | `a1b2c3d4-e5f6-...` |
| name | `"User " + 6-char random alphanumeric` | `User K9X2M7` |
| email | `<random>@aseanflow.auto` | `k9x2m7@aseanflow.auto` |
| accountNumber | `AF` + 10-digit padded sequential | `AF0000000001` |

### Account Number Generation

- Query `MAX(accountNumber)` from existing users
- Strip `AF` prefix, parse as integer, increment by 1
- Re-pad to 10 digits with `AF` prefix
- If no users exist, start at `AF0000000001`
- Wrap in transaction to prevent race conditions

### API Changes

**New endpoint: `POST /users/init`**

```typescript
// user.controller.ts
@Post('init')
async initUser(@Body() body: { cookieToken: string }) {
  return this.userService.initUser(body.cookieToken);
}
```

**New service method: `UserService.initUser(cookieToken)`**

```typescript
async initUser(cookieToken: string) {
  // 1. Check if user already exists with this cookieToken
  // 2. If yes, return existing user
  // 3. If no, create user with generated fields + wallets
  // 4. Return user with wallets
}
```

### Frontend Changes

**`apps/web/app/send/page.tsx`**

- Replace hardcoded `DEMO_TOKEN` with UUID generation (`crypto.randomUUID()`)
- On mount: check cookie → if none, generate token, set cookie, call init API
- Add Next.js API route proxy: `POST /api/users/init` → NestJS backend

### Seed Changes

**`packages/database/prisma/seed.ts`**

- Remove all demo user creation (juan, test users)
- Remove associated wallet and transfer seeding
- Keep any other seed data (e.g., currency records) if present

### Error Handling

- **Race condition** (duplicate cookieToken): API returns existing user instead of error
- **Stale cookie** (cookie exists but user not found): frontend clears cookie and re-inits
- **Account number collision**: transaction ensures atomicity

## Files Changed

| File | Change |
|------|--------|
| `apps/api/src/modules/user/user.service.ts` | Add `initUser()` method |
| `apps/api/src/modules/user/user.controller.ts` | Add `POST /init` endpoint |
| `apps/web/app/send/page.tsx` | UUID cookie + init call on first visit |
| `apps/web/app/api/users/init/route.ts` | New proxy route |
| `apps/web/lib/api/hooks.ts` | Add `useInitUser` hook |
| `apps/web/lib/api/user.ts` | Add `initUser` API call |
| `packages/database/prisma/seed.ts` | Remove demo users |

## Constraints

- No auth/login/KYC — cookieToken is sole identifier
- Prisma Decimal for money (wallets start at 0)
- Package namespace: `@aseanflow`
