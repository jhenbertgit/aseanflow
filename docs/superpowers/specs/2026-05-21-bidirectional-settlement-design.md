# Bidirectional PHP↔IDR Settlement

Date: 2026-05-21

## Problem

Current system only handles PHP→IDR transfers. IDR→PHP direction needed for reverse settlement.

## Decision

Convert one-directional flow to bidirectional. User selects source currency; target auto-sets to opposite. Same state machine, same settlement rails, same fee structure for both directions.

## Scope

- Shared types: expand `from`/`to` enums
- FX service: accept both directions, invert rate for IDR→PHP
- Quote calculator: add currency selector
- Transfer service: allow IDR as source currency

Out of scope: new settlement rails, new fee tiers, Prisma schema changes, Morph changes.

## Changes

### 1. Shared Types — `packages/shared/src/types/transfer.ts`

- `from` enum: `['PHP']` → `['PHP', 'IDR']`
- `to` enum: `['IDR']` → `['PHP', 'IDR']`
- Add runtime validation: reject if `from === to`

### 2. FX Service — `apps/api/src/modules/fx/fx.service.ts`

- `calculateQuote()` accepts either direction
- IDR→PHP rate = `1 / phpToIdrRate` using Prisma `Decimal` (avoids float precision loss)
- Fee calculation identical for both directions
- AFT discount logic unchanged
- Redis cache key remains `fx:rate:PHP-IDR` — single source of truth, inverted at read time

### 3. Transfer Service — `apps/api/src/modules/transfer/transfer.service.ts`

- Remove hardcoded PHP-source assumption (if any)
- Validate `sourceCurrency !== targetCurrency`
- State machine, wallet creation, tracking code generation unchanged

### 4. Quote Calculator — `apps/web/components/quote-calculator.tsx`

- Add currency pair toggle (swap button or dropdown)
- Default: PHP→IDR (preserves current UX)
- When user selects "Send IDR", "Receive" auto-sets to PHP
- Amount input works in source currency
- Quote API call sends `from`/`to` based on selection

### 5. Frontend Pages

- Home page (`apps/web/app/page.tsx`): pass direction prop to quote calculator
- Transfer status page: already reads `sourceCurrency`/`targetCurrency` from API — no change needed
- Timeline component: already generic — no change needed

## Data Flow (IDR→PHP)

```
User selects "Send IDR" → enters amount
Frontend calls POST /api/quote { amount: 500000, from: "IDR", to: "PHP" }
FX service: rate = 1 / cachedPHPtoIDR (Decimal)
Returns { rate: 0.003458, fee: ..., receiveAmount: ... }
User confirms → POST /api/transfer { amount, from: "IDR", to: "PHP" }
State machine runs: CREATED → ... → SETTLED → MORPH_ANCHORED
```

## Precision

Rate inversion uses `Decimal`:
```typescript
const invertedRate = new Decimal(1).div(cachedRate);
```
Never use `1 / parseFloat(rate)` — loses precision on small values.

## Files Modified

| File | Change |
|------|--------|
| `packages/shared/src/types/transfer.ts` | Expand `from`/`to` enums, add validation |
| `apps/api/src/modules/fx/fx.service.ts` | Bidirectional quote, invert rate |
| `apps/api/src/modules/transfer/transfer.service.ts` | Allow IDR source, validate direction |
| `apps/web/components/quote-calculator.tsx` | Currency selector UI |
| `apps/web/app/page.tsx` | Wire direction to quote calculator |

## Files Unchanged

- `packages/database/prisma/schema.prisma` — already direction-agnostic
- `apps/web/components/transfer-timeline.tsx` — already generic
- `apps/web/app/transfer/[id]/page.tsx` — reads from API
- Redis/queue/Morph logic — no change
