# Send Page Recipient Redesign

**Date:** 2026-05-24
**Status:** Approved

## Summary

Redesign `/send` page to support two recipient modes (ASEANFlow wallet vs bank account) and display recipient info on the transfer timeline. Full-stack: Prisma migration, shared types, backend validation, frontend UI.

## Approach

Single form with tab toggle (Approach A). Shared currency/quote fields, conditional recipient section. Matches GCash pattern.

## UI Layout

```
┌─────────────────────────┐
│ ← Back                  │
├─────────────────────────┤
│ [ASEANFlow] [Bank]  tabs│
├─────────────────────────┤
│ FROM: [PHP ▼]  [amount] │
│        ↕ swap            │
│ TO:   [IDR ▼]  (quote)  │
├─────────────────────────┤
│ Rate / Fee / Receive     │
├─────────────────────────┤
│ --- Recipient Section ---│
│ Wallet: Wallet ID input  │
│ Bank: Name, Bank, Acct   │
├─────────────────────────┤
│ [Continue Transfer →]   │
└─────────────────────────┘
```

### Components

- **QuoteCalculator** — refactor to add tab toggle and recipient fields. Single component, no new files.

### Currency direction

- PHP↔IDR swap button (already exists)
- Both recipient modes share same currency controls

## Backend Changes

### Prisma Schema

```prisma
model Transfer {
  // existing fields unchanged

  recipientType     RecipientType @default(WALLET)
  recipientName     String?
  recipientBank     String?       // bank code e.g. "BCA"
  recipientAccount  String?       // bank account number
  recipientWalletId String?       // ASEANFlow wallet ID
}

enum RecipientType {
  WALLET
  BANK
}
```

### Shared Types (packages/shared)

Updated `CreateTransferSchema` with recipient fields and refine validation:

```typescript
export const CreateTransferSchema = z.object({
  amount: z.number().positive().max(1000000),
  from: z.enum(['PHP', 'IDR']),
  to: z.enum(['PHP', 'IDR']),
  trackingCode: z.string().optional(),
  recipientType: z.enum(['WALLET', 'BANK']),
  recipientWalletId: z.string().optional(),
  recipientName: z.string().optional(),
  recipientBank: z.string().optional(),
  recipientAccount: z.string().optional(),
}).refine(data => {
  if (data.recipientType === 'WALLET') return !!data.recipientWalletId;
  return !!data.recipientName && !!data.recipientBank && !!data.recipientAccount;
});
```

### Bank List (packages/shared)

```typescript
export const INDONESIAN_BANKS = [
  { code: 'BCA', name: 'Bank Central Asia (BCA)' },
  { code: 'BNI', name: 'Bank Negara Indonesia (BNI)' },
  { code: 'BRI', name: 'Bank Rakyat Indonesia (BRI)' },
  { code: 'MANDIRI', name: 'Bank Mandiri' },
  { code: 'PERMATA', name: 'Bank Permata' },
  { code: 'BSI', name: 'Bank Syariah Indonesia' },
  { code: 'CIMB', name: 'CIMB Niaga' },
  { code: 'DANAMON', name: 'Bank Danamon' },
  { code: 'MEGA', name: 'Bank Mega' },
  { code: 'PANIN', name: 'Panin Bank' },
] as const;
```

### API Endpoints

| Endpoint | Change |
|----------|--------|
| `POST /api/quote` | No change |
| `POST /api/transfer` | Accept recipient fields, validate by recipientType |
| `GET /api/transfer/:trackingCode` | Return recipient fields |

## Validation Rules

**Wallet mode:**
- `recipientWalletId` — required, string

**Bank mode:**
- `recipientName` — required, 2-100 chars
- `recipientBank` — required, must match INDONESIAN_BANKS code
- `recipientAccount` — required, 6-20 digits only

## Error Handling

- Backend returns 400 with field-level errors
- Frontend shows inline validation errors per field
- Quote works independently — recipient validation only on "Continue Transfer"

## Transfer Timeline Display

- Wallet mode: "To: Wallet •••1234"
- Bank mode: "To: John Doe • BCA •••4567"
- No change to timeline/polling logic

## Files to Change

### Shared (packages/shared)
- `src/types/transfer.ts` — add recipient fields to schemas
- `src/constants/banks.ts` — new file, INDONESIAN_BANKS
- `src/index.ts` — export new constants

### Database (packages/database)
- `prisma/schema.prisma` — add recipient fields + RecipientType enum
- Migration file

### Backend (apps/api)
- `src/modules/transfer/dto/` — update CreateTransferDto with recipient fields
- `src/modules/transfer/transfer.service.ts` — persist recipient fields
- `src/modules/transfer/transfer.controller.ts` — no change (DTO handles it)

### Frontend (apps/web)
- `components/quote-calculator.tsx` — major refactor: tab toggle, recipient fields
- `lib/api/transfer.ts` — update createTransfer call with recipient fields
- `lib/api/hooks.ts` — update useCreateTransfer hook
- `app/transfer/[trackingCode]/page.tsx` — display recipient info