name: "PRP 12 — Bidirectional PHP↔IDR Settlement"
description: |

  ## Purpose

  Convert one-directional PHP→IDR flow to bidirectional. User selects source currency (PHP or IDR); target auto-sets to opposite. Same state machine, same settlement rails, same fee structure.

  ## Core Principles

  1. **Context is King**: Include ALL docs, examples, caveats
  2. **Validation Loops**: Provide executable tests/lints AI can run + fix
  3. **Information Dense**: Use codebase keywords + patterns
  4. **Progressive Success**: Start simple, validate, enhance
  5. **Global rules**: Follow all rules in `CLAUDE.md`

---

## Goal

Enable IDR→PHP transfers alongside existing PHP→IDR. Quote calculator gets currency toggle. FX service inverts rate via `Decimal`. Transfer service uses `dto.from`/`dto.to` instead of hardcoded values. Transfer status page renders currency dynamically.

## Why

- **Reverse settlement**: Users need both directions for real cross-border payments
- **Same infrastructure**: State machine, settlement, Morph — all direction-agnostic already
- **Minimal schema change**: Prisma `Currency` enum already has PHP + IDR, `sourceCurrency`/`targetCurrency` already `Currency` type

## What

### User-visible behavior
- Quote calculator shows currency toggle (swap button or dropdown)
- Default: PHP→IDR (preserves current UX)
- Selecting "Send IDR" auto-sets "Receive PHP"
- Amount input works in source currency
- Quote shows correct rate direction (e.g., "1 IDR = 0.003458 PHP")
- Transfer status page shows correct currency symbols for either direction
- Home page copy no longer says "PHP → IDR" exclusively

### Technical requirements
- Expand Zod enums: `from` and `to` accept `['PHP', 'IDR']`
- Add runtime validation: reject `from === to`
- FX service: always fetch PHP→IDR rate, invert for IDR→PHP using `Decimal`
- DTOs: expand `@IsEnum` decorators
- Transfer service: replace hardcoded `'PHP'`/`'IDR'` with `dto.from`/`dto.to`
- Quote calculator: add currency selector state
- API hooks: pass direction params through
- Transfer status page: dynamic currency display based on `sourceCurrency`

### Success Criteria

- [ ] Zod schemas accept `from: 'PHP'|'IDR'`, `to: 'PHP'|'IDR'`, reject `from === to`
- [ ] FX service returns correct inverted rate for IDR→PHP using `Decimal`
- [ ] Transfer service stores `dto.from`/`dto.to` instead of hardcoded values
- [ ] Quote calculator has currency toggle, defaults to PHP→IDR
- [ ] Transfer status page shows correct currency symbols for both directions
- [ ] Existing PHP→IDR flow untouched — all existing tests pass
- [ ] New tests cover IDR→PHP quote calculation and transfer creation

## All Needed Context

### Documentation & References

```yaml
- file: packages/shared/src/types/transfer.ts
  why: Zod schemas that MUST be expanded — current enums hardcoded to ['PHP']/['IDR']

- file: apps/api/src/modules/fx/fx.service.ts
  why: Rate fetching + quote calc — must add inversion logic. Key: getRate() uses cache key fx:${from}:${to}

- file: apps/api/src/modules/transfer/transfer.service.ts
  why: createTransfer() hardcodes sourceCurrency:'PHP', targetCurrency:'IDR' on line 70-71 — must use dto.from/dto.to

- file: apps/api/src/modules/transfer/dto/create-quote.dto.ts
  why: @IsEnum(['PHP']) and @IsEnum(['IDR']) — must expand to @IsEnum(['PHP', 'IDR'])

- file: apps/api/src/modules/transfer/dto/create-transfer.dto.ts
  why: Same @IsEnum hardcoding — must expand

- file: apps/web/components/quote-calculator.tsx
  why: Hardcoded PHP→IDR UI — needs currency toggle + dynamic display

- file: apps/web/lib/api/hooks.ts
  why: useQuote and useCreateTransfer hardcode 'PHP'/'IDR' — must accept direction params

- file: apps/web/lib/api/quote.ts
  why: getQuote() already accepts from/to params — just needs hooks to pass them

- file: apps/web/lib/api/transfer.ts
  why: createTransfer() already accepts from/to — just needs hooks to pass them

- file: apps/web/app/transfer/[id]/page.tsx
  why: Hardcoded ₱ symbol on line 111, Rp on line 119 — must be dynamic based on sourceCurrency/targetCurrency

- file: apps/web/app/page.tsx
  why: Line 33 "Send PHP → IDR directly" — update for bidirectional

- file: packages/database/prisma/schema.prisma
  why: Already direction-agnostic — Currency enum has PHP+IDR, sourceCurrency/targetCurrency are Currency type. NO CHANGES NEEDED.

- doc: Prisma Decimal
  url: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-decimal
  why: Rate inversion MUST use Decimal.div(), never 1/parseFloat()

- doc: Zod enum validation
  url: https://zod.dev/?id=enums
  why: z.enum() + z.refine() for cross-field validation (from !== to)
```

### Current Codebase tree (relevant files)

```txt
packages/shared/src/types/transfer.ts          # Zod schemas + types
apps/api/src/modules/fx/fx.service.ts           # Rate fetch + quote calc
apps/api/src/modules/fx/fx.service.spec.ts      # FX tests
apps/api/src/modules/transfer/transfer.service.ts  # Transfer creation
apps/api/src/modules/transfer/transfer.service.spec.ts  # Transfer tests
apps/api/src/modules/transfer/dto/create-quote.dto.ts    # Quote DTO
apps/api/src/modules/transfer/dto/create-transfer.dto.ts  # Transfer DTO
apps/api/src/modules/transfer/transfer.controller.ts      # API endpoints
apps/web/components/quote-calculator.tsx        # Quote UI component
apps/web/app/send/page.tsx                      # Send page
apps/web/app/page.tsx                           # Landing page
apps/web/app/transfer/[id]/page.tsx             # Transfer status page
apps/web/lib/api/hooks.ts                       # React Query hooks
apps/web/lib/api/quote.ts                       # Quote API client
apps/web/lib/api/transfer.ts                    # Transfer API client
apps/web/lib/constants.ts                       # Shared constants
```

### Desired Codebase tree

```txt
packages/shared/src/types/transfer.ts          # MODIFY: expand enums, add from≠to validation
apps/api/src/modules/fx/fx.service.ts           # MODIFY: bidirectional rate, invert via Decimal
apps/api/src/modules/fx/fx.service.spec.ts      # MODIFY: add IDR→PHP test cases
apps/api/src/modules/transfer/transfer.service.ts  # MODIFY: use dto.from/dto.to
apps/api/src/modules/transfer/transfer.service.spec.ts  # MODIFY: add IDR→PHP transfer test
apps/api/src/modules/transfer/dto/create-quote.dto.ts    # MODIFY: expand @IsEnum
apps/api/src/modules/transfer/dto/create-transfer.dto.ts  # MODIFY: expand @IsEnum + add from≠to validation
apps/web/components/quote-calculator.tsx        # MODIFY: currency toggle + dynamic display
apps/web/app/page.tsx                           # MODIFY: update tagline
apps/web/app/transfer/[id]/page.tsx             # MODIFY: dynamic currency symbols
apps/web/lib/api/hooks.ts                       # MODIFY: pass from/to through
apps/web/lib/constants.ts                       # MODIFY: add currency display config
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Rate inversion MUST use Prisma Decimal, never float
// BAD: const inverted = 1 / parseFloat(rate)  // loses precision on small values
// GOOD: const invertedRate = new Prisma.Decimal(1).div(cachedRate)
//       or: const invertedRate = new Decimal(1).div(cachedRate)
// NOTE: fx.service.ts currently uses `number` for rates internally (parseFloat from Redis)
//       For inversion, convert to Decimal first, then back to number for API response

// CRITICAL: FxService.getRate() cache key is `fx:${from}:${to}`
// For bidirectional, always request PHP→IDR canonical rate, invert if needed
// Don't create separate IDR→PHP cache entry — single source of truth

// CRITICAL: Transfer service line 70-71 hardcodes:
//   sourceCurrency: 'PHP',
//   targetCurrency: 'IDR',
// Must change to: sourceCurrency: dto.from, targetCurrency: dto.to

// CRITICAL: Transfer status page has hardcoded currency symbols:
//   Line 111: ₱ (for sourceCurrency)
//   Line 119: Rp (for targetCurrency)
// Must use lookup: { PHP: '₱', IDR: 'Rp' }

// CRITICAL: Zod cross-field validation uses .refine()
//   CreateQuoteSchema.refine(data => data.from !== data.to, { message: "..." })

// CRITICAL: class-validator @IsEnum(['PHP', 'IDR']) must match exactly
//   Currently: @IsEnum(['PHP']) — expand to @IsEnum(['PHP', 'IDR'])

// CRITICAL: QuoteCalculator displays fee as "₱{quote.fee}"
//   For IDR→PHP, fee should display in source currency (Rp)
//   Fee is always in source currency — need dynamic symbol

// CRITICAL: useQuote hook has hardcoded queryKey ["quote", debouncedAmount, debouncedTrackingCode]
//   Must include from/to in queryKey so direction changes trigger new fetch
```

## Implementation Blueprint

### Data models and structure

```typescript
// No Prisma changes needed — schema already direction-agnostic
// Currency enum: PHP | IDR (already exists)
// Transfer.sourceCurrency: Currency (already generic)
// Transfer.targetCurrency: Currency (already generic)

// Shared types expansion:
const CURRENCY_SYMBOLS = { PHP: '₱', IDR: 'Rp' } as const;
const SUPPORTED_CURRENCIES = ['PHP', 'IDR'] as const;
type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// Zod schemas — expand enums + add cross-validation:
const CreateQuoteSchema = z.object({
  amount: z.number().positive().max(1000000),
  from: z.enum(['PHP', 'IDR']),
  to: z.enum(['PHP', 'IDR']),
  trackingCode: z.string().optional(),
}).refine(data => data.from !== data.to, {
  message: 'Source and target currencies must differ',
  path: ['to'],
});
```

### List of tasks (in order)

```yaml
Task 1 — Shared types:
MODIFY packages/shared/src/types/transfer.ts:
  - FIND pattern: "z.enum(['PHP'])" in CreateQuoteSchema
  - REPLACE with: z.enum(['PHP', 'IDR'])
  - FIND pattern: "z.enum(['IDR'])" in CreateQuoteSchema
  - REPLACE with: z.enum(['PHP', 'IDR'])
  - Same for CreateTransferSchema
  - ADD .refine() to both schemas: reject from === to
  - ADD CURRENCY_SYMBOLS constant export: { PHP: '₱', IDR: 'Rp' }

Task 2 — Backend DTOs:
MODIFY apps/api/src/modules/transfer/dto/create-quote.dto.ts:
  - FIND: "@IsEnum(['PHP'])"
  - REPLACE with: "@IsEnum(['PHP', 'IDR'])"
  - FIND: "@IsEnum(['IDR'])"
  - REPLACE with: "@IsEnum(['PHP', 'IDR'])"
  - ADD: custom validation or use @ValidateBy for from !== to

MODIFY apps/api/src/modules/transfer/dto/create-transfer.dto.ts:
  - Same @IsEnum expansion
  - ADD: from !== to validation

Task 3 — FX Service (bidirectional rate):
MODIFY apps/api/src/modules/fx/fx.service.ts:
  - ADD: canonical rate method that always fetches PHP→IDR
  - MODIFY calculateQuote(): if from==='IDR' && to==='PHP', invert rate using Decimal
  - PATTERN: const invertedRate = new Prisma.Decimal(1).div(rate).toNumber()
  - KEEP: same fee calculation for both directions
  - KEEP: same AFT discount logic
  - KEEP: same cache key pattern (always cache PHP→IDR canonical)
  - ADD: import Decimal from '@prisma/client/runtime/library' or use Prisma.Decimal

Task 4 — Transfer Service:
MODIFY apps/api/src/modules/transfer/transfer.service.ts:
  - FIND lines 70-71:
      sourceCurrency: 'PHP',
      targetCurrency: 'IDR',
  - REPLACE with:
      sourceCurrency: dto.from,
      targetCurrency: dto.to,
  - ADD: early validation dto.from !== dto.to (belt-and-suspenders with Zod)

Task 5 — Frontend constants:
MODIFY apps/web/lib/constants.ts:
  - ADD: export const CURRENCY_SYMBOLS = { PHP: '₱', IDR: 'Rp' } as const
  - ADD: export const CURRENCY_NAMES = { PHP: 'Philippine Peso', IDR: 'Indonesian Rupiah' } as const

Task 6 — Frontend API hooks:
MODIFY apps/web/lib/api/hooks.ts:
  - useQuote: accept from/to params, include in queryKey, pass to getQuote()
    - CHANGE signature: useQuote(amount, from = 'PHP', to = 'IDR', trackingCode?)
    - CHANGE queryKey: ["quote", debouncedAmount, from, to, debouncedTrackingCode]
    - CHANGE queryFn: getQuote(debouncedAmount, from, to, debouncedTrackingCode || undefined)
  - useCreateTransfer: accept from/to params
    - CHANGE mutationFn to accept { amount, from, to, trackingCode }
    - Pass from/to to createTransfer()

Task 7 — Quote Calculator (currency toggle):
MODIFY apps/web/components/quote-calculator.tsx:
  - ADD: direction state: 'PHP_TO_IDR' | 'IDR_TO_PHP', default 'PHP_TO_IDR'
  - ADD: derived from/to from direction state
  - ADD: swap button (↔ ArrowUpDown icon) to toggle direction
  - MODIFY: CardTitle dynamic — "Send PHP → IDR" or "Send IDR → PHP"
  - MODIFY: amount label + symbol — "You send (PHP)" with ₱ or "You send (IDR)" with Rp
  - MODIFY: fee display — use source currency symbol
  - MODIFY: rate display — "1 PHP = X IDR" or "1 IDR = X PHP"
  - MODIFY: receive display — "They receive" with target currency symbol + name
  - MODIFY: pass from/to to useQuote and useCreateTransfer hooks
  - MODIFY: error message — dynamic min/max based on source currency

Task 8 — Transfer status page (dynamic currency):
MODIFY apps/web/app/transfer/[id]/page.tsx:
  - IMPORT: CURRENCY_SYMBOLS from '@/lib/constants'
  - REPLACE hardcoded ₱ on line 111 with: CURRENCY_SYMBOLS[transfer.sourceCurrency as keyof typeof CURRENCY_SYMBOLS]
  - REPLACE hardcoded Rp on line 119 with: CURRENCY_SYMBOLS[transfer.targetCurrency as keyof typeof CURRENCY_SYMBOLS]
  - MODIFY Intl.NumberFormat locale based on currency (en-PH for PHP, id-ID for IDR)

Task 9 — Home page copy:
MODIFY apps/web/app/page.tsx:
  - CHANGE line 33: "Send PHP → IDR directly" → "Send PHP ↔ IDR directly"

Task 10 — Tests:
MODIFY apps/api/src/modules/fx/fx.service.spec.ts:
  - ADD: describe('calculateQuote IDR→PHP')
  - ADD: test 'inverts PHP→IDR rate for IDR→PHP'
  - ADD: test 'calculates correct receiveAmount for IDR→PHP'

MODIFY apps/api/src/modules/transfer/transfer.service.spec.ts:
  - ADD: test 'creates IDR→PHP transfer with correct currencies'
  - VERIFY: existing PHP→IDR tests still pass
```

### Per-task pseudocode

```typescript
// Task 3 — FX Service bidirectional rate
// PATTERN: Always fetch canonical PHP→IDR, invert for IDR→PHP
async calculateQuote(amount: number, from: string, to: string, trackingCode?: string) {
  // Always get PHP→IDR canonical rate from cache/API
  const canonicalRate = await this.getRate('PHP', 'IDR');

  // Determine effective rate based on direction
  let rate: number;
  if (from === 'IDR' && to === 'PHP') {
    // CRITICAL: Use Decimal for inversion — never 1/parseFloat
    rate = new Prisma.Decimal(1).div(canonicalRate).toNumber();
  } else {
    rate = canonicalRate;
  }

  // Fee calculation IDENTICAL for both directions
  let fee = 10;
  // ... existing discount logic unchanged ...

  const receiveAmount = (amount - fee) * rate;
  return { rate, fee, receiveAmount, timestamp: Date.now(), discount };
}

// Task 7 — Quote Calculator currency toggle
// PATTERN: Simple state toggle, derived from/to
const [direction, setDirection] = useState<'PHP_TO_IDR' | 'IDR_TO_PHP'>('PHP_TO_IDR');
const from = direction === 'PHP_TO_IDR' ? 'PHP' : 'IDR';
const to = direction === 'PHP_TO_IDR' ? 'IDR' : 'PHP';

// Swap button handler
function handleSwap() {
  setDirection(d => d === 'PHP_TO_IDR' ? 'IDR_TO_PHP' : 'PHP_TO_IDR');
}

// Pass to hooks
const { data: quote } = useQuote(amount, from, to, trackingCode || undefined);
// createTransfer.mutate({ amount, from, to, trackingCode });
```

### Integration Points

```yaml
DATABASE:
  - No migration needed — Currency enum already has PHP + IDR
  - sourceCurrency/targetCurrency already type Currency

SHARED_PACKAGE:
  - MODIFY packages/shared/src/types/transfer.ts
  - Rebuild: pnpm build --filter @aseanflow/shared
  - Frontend + backend both consume from this package

API_DTOs:
  - MODIFY create-quote.dto.ts and create-transfer.dto.ts
  - Must match Zod schema expansion

FRONTEND:
  - MODIFY quote-calculator.tsx — main UI change
  - MODIFY hooks.ts — pass direction through
  - MODIFY transfer/[id]/page.tsx — dynamic currency display
  - MODIFY page.tsx — tagline update
```

## Validation Loop

### Level 1: Build & Type Check

```bash
# Build shared package first (other packages depend on it)
pnpm build --filter @aseanflow/shared

# Type check API
cd apps/api && pnpm type-check

# Type check web
cd apps/web && pnpm type-check

# Lint all
pnpm lint

# Expected: No type errors, no lint errors
```

### Level 2: Unit Tests

```bash
# Run FX service tests (includes new IDR→PHP test cases)
cd apps/api && pnpm test -- fx.service.spec

# Run transfer service tests (includes new IDR→PHP transfer test)
cd apps/api && pnpm test -- transfer.service.spec

# Run all API tests
cd apps/api && pnpm test

# Expected: All tests pass — both existing PHP→IDR and new IDR→PHP
```

### Level 3: Manual Integration Test

```bash
# Start dev environment
docker compose -f docker-compose.dev.yml up -d
pnpm dev

# Test PHP→IDR (existing flow, must still work)
curl -X POST http://localhost:3001/api/quote \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "from": "PHP", "to": "IDR"}'
# Expected: { rate: ~289.2, fee: 10, receiveAmount: ~286308, ... }

# Test IDR→PHP (new direction)
curl -X POST http://localhost:3001/api/quote \
  -H "Content-Type: application/json" \
  -d '{"amount": 500000, "from": "IDR", "to": "PHP"}'
# Expected: { rate: ~0.003458 (1/289.2), fee: 10, receiveAmount: ~1728.6, ... }

# Test same-currency rejection
curl -X POST http://localhost:3001/api/quote \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "from": "PHP", "to": "PHP"}'
# Expected: 400 Bad Request — validation error

# Test IDR→PHP transfer creation
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"amount": 500000, "from": "IDR", "to": "PHP"}'
# Expected: { trackingCode: "TXN...", status: "CREATED" }

# Verify transfer has correct currencies
curl http://localhost:3001/api/transfer/TXN...
# Expected: sourceCurrency: "IDR", targetCurrency: "PHP"

# Frontend: open http://localhost:3000/send
# 1. Default should show "Send PHP → IDR"
# 2. Click swap → should show "Send IDR → PHP"
# 3. Enter amount → quote should update
# 4. Click "Continue Transfer" → should redirect to timeline
# 5. Timeline should show "Rp 500,000 IDR" sent, "₱ 1,728.60 PHP" received
```

## Final Validation Checklist

- [ ] All tests pass: `cd apps/api && pnpm test`
- [ ] No type errors: `pnpm type-check` in both api and web
- [ ] No lint errors: `pnpm lint`
- [ ] PHP→IDR flow unchanged (regression check)
- [ ] IDR→PHP quote returns inverted rate via Decimal
- [ ] Same-currency (PHP→PHP or IDR→IDR) rejected with validation error
- [ ] Quote calculator toggle works in both directions
- [ ] Transfer status page shows correct currency symbols for IDR→PHP
- [ ] Fee displayed in source currency for both directions

---

## Anti-Patterns to Avoid

- ❌ Don't use `1 / parseFloat(rate)` for inversion — loses precision. Use `Decimal.div()`
- ❌ Don't create separate Redis cache entries for IDR→PHP — single canonical rate
- ❌ Don't hardcode new currency assumptions — use lookup maps
- ❌ Don't skip the `from === to` validation — protect at both Zod and DTO level
- ❌ Don't change Prisma schema — already direction-agnostic
- ❌ Don't modify transfer state machine or settlement flow — direction-independent
- ❌ Don't forget to include `from`/`to` in React Query `queryKey` — stale data if direction changes
- ❌ Don't break existing PHP→IDR tests — they must pass unchanged

---

## PRP Quality Score: 8/10

**Confidence reasoning:**
- All files identified, exact line numbers for changes
- Existing patterns well-documented (Zod schemas, DTOs, hooks)
- Prisma schema already direction-agnostic — no migration risk
- Tests exist and can be extended
- Main risk: QuoteCalculator UI complexity (currency toggle + dynamic display) — but pattern is straightforward

**Deduction reasons:**
- -1: FX service `getRate()` currently uses dynamic cache key `fx:${from}:${to}`. The canonical approach (always fetch PHP→IDR, invert) requires restructuring cache access pattern — moderate complexity
- -1: QuoteCalculator is the largest single change (state management + 8+ display changes) — UI bugs possible
