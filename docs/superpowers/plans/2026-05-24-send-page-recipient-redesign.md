# Send Page Recipient Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two-mode recipient flow (ASEANFlow wallet / bank account) to the /send page with full-stack support.

**Architecture:** Shared constants + Zod schemas in packages/shared, Prisma migration in packages/database, backend DTO/service updates in apps/api, frontend UI refactor in apps/web. Single form with tab toggle, conditional recipient fields.

**Tech Stack:** Prisma v7, Zod, NestJS class-validator, Next.js 16, React 19, shadcn/ui Tabs component, Framer Motion.

---

## File Structure

### New files
- `packages/shared/src/constants/banks.ts` — Indonesian bank list

### Modified files
- `packages/database/prisma/schema.prisma` — RecipientType enum + Transfer recipient fields
- `packages/shared/src/types/transfer.ts` — recipient fields in CreateTransferSchema, TransferDetailResponse
- `packages/shared/src/index.ts` — re-export (already uses `export * from "./constants"`, auto-included)
- `apps/api/src/modules/transfer/dto/create-transfer.dto.ts` — recipient fields + validation
- `apps/api/src/modules/transfer/transfer.service.ts` — persist recipient fields
- `apps/web/lib/api/transfer.ts` — createTransfer accepts recipient payload
- `apps/web/lib/api/hooks.ts` — useCreateTransfer mutation includes recipient fields
- `apps/web/components/quote-calculator.tsx` — tab toggle + recipient section
- `apps/web/app/transfer/[trackingCode]/page.tsx` — display recipient info

---

### Task 1: Add bank list constant to shared package

**Files:**
- Create: `packages/shared/src/constants/banks.ts`

- [ ] **Step 1: Create banks.ts constant file**

```typescript
// packages/shared/src/constants/banks.ts

export const INDONESIAN_BANKS = [
  { code: "BCA", name: "Bank Central Asia (BCA)" },
  { code: "BNI", name: "Bank Negara Indonesia (BNI)" },
  { code: "BRI", name: "Bank Rakyat Indonesia (BRI)" },
  { code: "MANDIRI", name: "Bank Mandiri" },
  { code: "PERMATA", name: "Bank Permata" },
  { code: "BSI", name: "Bank Syariah Indonesia" },
  { code: "CIMB", name: "CIMB Niaga" },
  { code: "DANAMON", name: "Bank Danamon" },
  { code: "MEGA", name: "Bank Mega" },
  { code: "PANIN", name: "Panin Bank" },
] as const;

export type IndonesianBankCode = (typeof INDONESIAN_BANKS)[number]["code"];
```

No `index.ts` change needed — `packages/shared/src/index.ts` already has `export * from "./constants"`.

- [ ] **Step 2: Verify export**

Run: `cd packages/shared && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/banks.ts
git commit -m "feat(shared): add Indonesian bank list constant"
```

---

### Task 2: Update Prisma schema with recipient fields

**Files:**
- Modify: `packages/database/prisma/schema.prisma`

- [ ] **Step 1: Add RecipientType enum and Transfer fields**

Add after the existing `TransferStatus` enum:

```prisma
enum RecipientType {
  WALLET
  BANK
}
```

Add to the `Transfer` model, after the `bifastRef` field and before `walletId`:

```prisma
  recipientType     RecipientType @default(WALLET)
  recipientName     String?
  recipientBank     String?
  recipientAccount  String?
  recipientWalletId String?
```

- [ ] **Step 2: Generate migration**

Run: `cd packages/database && npx prisma migrate dev --name add_recipient_fields`
Expected: Migration created and applied successfully

- [ ] **Step 3: Generate Prisma client**

Run: `cd packages/database && npx prisma generate`
Expected: Client generated in `generated/prisma`

- [ ] **Step 4: Commit**

```bash
git add packages/database/prisma/schema.prisma packages/database/prisma/migrations/
git commit -m "feat(database): add recipient fields to Transfer model"
```

---

### Task 3: Update shared types (Zod schemas + TransferDetailResponse)

**Files:**
- Modify: `packages/shared/src/types/transfer.ts`

- [ ] **Step 1: Add recipient fields to CreateTransferSchema**

Replace the existing `CreateTransferSchema` with:

```typescript
export const CreateTransferSchema = z
  .object({
    quoteId: z.string().optional(),
    amount: z.number().positive(),
    from: z.enum(["PHP", "IDR"]),
    to: z.enum(["PHP", "IDR"]),
    idempotencyKey: z.string().uuid().optional(),
    trackingCode: z.string().optional(),
    recipientType: z.enum(["WALLET", "BANK"]),
    recipientWalletId: z.string().optional(),
    recipientName: z.string().optional(),
    recipientBank: z.string().optional(),
    recipientAccount: z.string().optional(),
  })
  .refine((data) => data.from !== data.to, {
    message: "Source and target currencies must differ",
    path: ["to"],
  })
  .refine(
    (data) =>
      data.recipientType === "WALLET" ? !!data.recipientWalletId : true,
    {
      message: "Wallet ID is required for wallet transfers",
      path: ["recipientWalletId"],
    },
  )
  .refine(
    (data) =>
      data.recipientType === "BANK"
        ? !!data.recipientName && !!data.recipientBank && !!data.recipientAccount
        : true,
    {
      message: "Recipient name, bank, and account are required for bank transfers",
      path: ["recipientName"],
    },
  );
```

- [ ] **Step 2: Add recipient fields to TransferDetailResponse**

Replace the existing `TransferDetailResponse` interface with:

```typescript
export interface TransferDetailResponse {
  trackingCode: string;
  status: string;
  sendAmount: number;
  receiveAmount: number;
  exchangeRate: number;
  fee: number;
  sourceCurrency: string;
  targetCurrency: string;
  recipientType: "WALLET" | "BANK";
  recipientWalletId: string | null;
  recipientName: string | null;
  recipientBank: string | null;
  recipientAccount: string | null;
  morphTxHash: string | null;
  walletAddress: string | null;
  rewardTxHash: string | null;
  rewardAmount: string | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 3: Verify types compile**

Run: `cd packages/shared && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/types/transfer.ts
git commit -m "feat(shared): add recipient fields to transfer schemas"
```

---

### Task 4: Update backend DTO

**Files:**
- Modify: `apps/api/src/modules/transfer/dto/create-transfer.dto.ts`

- [ ] **Step 1: Add recipient fields to CreateTransferDto**

Replace the full file content with:

```typescript
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Length,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CurrenciesDiffer } from "../../../common/decorators/currencies-differ.decorator";

export class CreateTransferDto {
  @ApiProperty({ example: 1000, description: "Amount in source currency" })
  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount!: number;

  @ApiProperty({ example: "PHP", enum: ["PHP", "IDR"] })
  @IsEnum(["PHP", "IDR"])
  from!: string;

  @ApiProperty({ example: "IDR", enum: ["PHP", "IDR"] })
  @IsEnum(["PHP", "IDR"])
  @CurrenciesDiffer({ message: "Source and target currencies must differ" })
  to!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  quoteId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiProperty({
    required: false,
    description: "Prior tracking code for returning users",
  })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiProperty({ example: "WALLET", enum: ["WALLET", "BANK"] })
  @IsEnum(["WALLET", "BANK"])
  recipientType!: string;

  @ApiProperty({
    required: false,
    description: "ASEANFlow wallet ID (required when recipientType is WALLET)",
  })
  @IsOptional()
  @IsString()
  recipientWalletId?: string;

  @ApiProperty({
    required: false,
    description: "Recipient full name (required when recipientType is BANK)",
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  recipientName?: string;

  @ApiProperty({
    required: false,
    description: "Bank code (required when recipientType is BANK)",
  })
  @IsOptional()
  @IsString()
  recipientBank?: string;

  @ApiProperty({
    required: false,
    description: "Bank account number (required when recipientType is BANK)",
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{6,20}$/, {
    message: "Account number must be 6-20 digits",
  })
  recipientAccount?: string;
}
```

- [ ] **Step 2: Verify backend compiles**

Run: `cd apps/api && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/transfer/dto/create-transfer.dto.ts
git commit -m "feat(api): add recipient fields to CreateTransferDto"
```

---

### Task 5: Update backend transfer service to persist recipient fields

**Files:**
- Modify: `apps/api/src/modules/transfer/transfer.service.ts`

- [ ] **Step 1: Add recipient fields to prisma.transfer.create data**

In the `createTransfer` method, update the `prisma.transfer.create` data block. Find this code:

```typescript
    const transfer = await this.prisma.transfer.create({
      data: {
        trackingCode,
        sourceCurrency: dto.from as 'PHP' | 'IDR',
        targetCurrency: dto.to as 'PHP' | 'IDR',
        sendAmount: new Prisma.Decimal(dto.amount),
        receiveAmount: new Prisma.Decimal(quote.receiveAmount),
        exchangeRate: new Prisma.Decimal(quote.rate),
        fee: new Prisma.Decimal(quote.fee),
        status: 'CREATED',
        walletId,
      },
    });
```

Replace with:

```typescript
    const transfer = await this.prisma.transfer.create({
      data: {
        trackingCode,
        sourceCurrency: dto.from as 'PHP' | 'IDR',
        targetCurrency: dto.to as 'PHP' | 'IDR',
        sendAmount: new Prisma.Decimal(dto.amount),
        receiveAmount: new Prisma.Decimal(quote.receiveAmount),
        exchangeRate: new Prisma.Decimal(quote.rate),
        fee: new Prisma.Decimal(quote.fee),
        status: 'CREATED',
        walletId,
        recipientType: dto.recipientType as 'WALLET' | 'BANK',
        recipientWalletId: dto.recipientWalletId || null,
        recipientName: dto.recipientName || null,
        recipientBank: dto.recipientBank || null,
        recipientAccount: dto.recipientAccount || null,
      },
    });
```

- [ ] **Step 2: Verify backend compiles**

Run: `cd apps/api && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/transfer/transfer.service.ts
git commit -m "feat(api): persist recipient fields on transfer creation"
```

---

### Task 6: Update frontend API client and hooks

**Files:**
- Modify: `apps/web/lib/api/transfer.ts`
- Modify: `apps/web/lib/api/hooks.ts`

- [ ] **Step 1: Update createTransfer function signature**

Replace the `createTransfer` function in `apps/web/lib/api/transfer.ts` with:

```typescript
import type {
  TransferDetailResponse,
  TransferResponse,
} from "@aseanflow/shared";

export interface CreateTransferPayload {
  amount: number;
  from: string;
  to: string;
  trackingCode?: string;
  recipientType: "WALLET" | "BANK";
  recipientWalletId?: string;
  recipientName?: string;
  recipientBank?: string;
  recipientAccount?: string;
}

export async function createTransfer(
  payload: CreateTransferPayload,
): Promise<TransferResponse> {
  const res = await fetch("/api/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Transfer creation failed: ${res.status}`);
  }

  return res.json();
}

export async function getTransferByTrackingCode(
  trackingCode: string,
): Promise<TransferDetailResponse> {
  const res = await fetch(`/api/transfer/${trackingCode}`);

  if (!res.ok) {
    if (res.status === 404) throw new Error("Transfer not found");
    throw new Error(`Failed to fetch transfer: ${res.status}`);
  }

  return res.json();
}
```

- [ ] **Step 2: Update useCreateTransfer hook**

In `apps/web/lib/api/hooks.ts`, replace the `useCreateTransfer` function with:

```typescript
export function useCreateTransfer() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => createTransfer(payload),
    onSuccess: (data) => {
      router.push(`/transfer/${data.trackingCode}`);
    },
  });
}
```

Also add the import at the top of the file:

```typescript
import { createTransfer, getTransferByTrackingCode, type CreateTransferPayload } from "./transfer";
```

And remove the old `createTransfer` import (replace `import { createTransfer, getTransferByTrackingCode } from "./transfer"` with the new one above).

- [ ] **Step 3: Verify frontend compiles**

Run: `cd apps/web && npx tsc --noEmit`
Expected: Errors from quote-calculator.tsx calling old createTransfer signature — that's expected, will fix in Task 7.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/api/transfer.ts apps/web/lib/api/hooks.ts
git commit -m "feat(web): update transfer API client with recipient payload"
```

---

### Task 7: Refactor QuoteCalculator with tab toggle and recipient fields

**Files:**
- Modify: `apps/web/components/quote-calculator.tsx`

This is the largest change. The component gains:
- Tab toggle (WALLET / BANK)
- Conditional recipient fields below the quote
- Updated handleContinue to pass recipient data

- [ ] **Step 1: Add shadcn Tabs component**

Run: `cd apps/web && pnpm dlx shadcn@latest add tabs`
Expected: Tabs component added to `@aseanflow/ui`

- [ ] **Step 2: Refactor QuoteCalculator**

Replace the full content of `apps/web/components/quote-calculator.tsx` with:

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@aseanflow/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aseanflow/ui/components/card";
import { Input } from "@aseanflow/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aseanflow/ui/components/select";
import { Tabs, TabsList, TabsTrigger } from "@aseanflow/ui/components/tabs";

import { LoadingState } from "@/components/ui/loading-state";
import { RewardBadge } from "@/components/reward-badge";
import { useCreateTransfer, useQuote, useWallet } from "@/lib/api/hooks";
import { CURRENCY_SYMBOLS } from "@/lib/constants";
import { INDONESIAN_BANKS } from "@aseanflow/shared";

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;
const ETA_SECONDS = "~10 seconds";
const TRACKING_CODE_RE = /^TXN[A-Z0-9]{3,12}$/;

type Direction = "PHP_TO_IDR" | "IDR_TO_PHP";
type RecipientMode = "WALLET" | "BANK";

export function QuoteCalculator() {
  const [amount, setAmount] = useState<number>(1000);
  const [trackingCode, setTrackingCode] = useState("");
  const [direction, setDirection] = useState<Direction>("PHP_TO_IDR");
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("WALLET");

  // Wallet recipient
  const [recipientWalletId, setRecipientWalletId] = useState("");

  // Bank recipient
  const [recipientName, setRecipientName] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");

  const from = direction === "PHP_TO_IDR" ? "PHP" : "IDR";
  const to = direction === "PHP_TO_IDR" ? "IDR" : "PHP";
  const sourceSymbol = CURRENCY_SYMBOLS[from];
  const targetSymbol = CURRENCY_SYMBOLS[to];

  const trackingCodeValid =
    !!trackingCode && TRACKING_CODE_RE.test(trackingCode);
  const { data: quote, isLoading, error: quoteError } = useQuote(
    amount,
    from,
    to,
    trackingCodeValid ? trackingCode : undefined,
  );
  const { data: wallet, isLoading: walletLoading } = useWallet(
    trackingCodeValid ? trackingCode : "",
  );
  const walletNotFound =
    trackingCodeValid && !walletLoading && wallet === null;
  const createTransfer = useCreateTransfer();

  const isAmountValid = amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
  const isSubmitting = createTransfer.isPending;
  const trackingCodeInvalid = !!trackingCode && !trackingCodeValid;

  const isWalletRecipientValid = recipientWalletId.trim().length > 0;
  const isBankRecipientValid =
    recipientName.trim().length >= 2 &&
    recipientBank.length > 0 &&
    /^\d{6,20}$/.test(recipientAccount);
  const isRecipientValid =
    recipientMode === "WALLET"
      ? isWalletRecipientValid
      : isBankRecipientValid;

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      setAmount(0);
      return;
    }
    const parsed = Number(raw);
    if (!isNaN(parsed) && parsed >= 0) {
      setAmount(parsed);
    }
  }

  function handleTrackingCodeChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    setTrackingCode(e.target.value.trim());
  }

  function handleSwap() {
    setDirection((d) =>
      d === "PHP_TO_IDR" ? "IDR_TO_PHP" : "PHP_TO_IDR",
    );
  }

  function handleContinue() {
    if (!isAmountValid || !quote || isSubmitting || !isRecipientValid) return;

    createTransfer.mutate({
      amount,
      from,
      to,
      trackingCode: trackingCode || undefined,
      recipientType: recipientMode,
      ...(recipientMode === "WALLET"
        ? { recipientWalletId: recipientWalletId.trim() }
        : {
            recipientName: recipientName.trim(),
            recipientBank,
            recipientAccount,
          }),
    });
  }

  const displayError = !isAmountValid && amount > 0;

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          Send {from} → {to}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleSwap}
            title="Swap direction"
          >
            ⇅
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount input */}
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            You send ({from})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {sourceSymbol}
            </span>
            <Input
              id="amount"
              type="number"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              value={amount || ""}
              onChange={handleAmountChange}
              className="text-lg pl-10"
              placeholder="Enter amount"
            />
          </div>
          {displayError && (
            <p className="text-sm text-destructive">
              Amount must be between {sourceSymbol}
              {MIN_AMOUNT} and {sourceSymbol}
              {MAX_AMOUNT.toLocaleString()}
            </p>
          )}
        </div>

        {/* Tracking code */}
        <div className="space-y-2">
          <label htmlFor="trackingCode" className="text-sm font-medium">
            Tracking code (optional)
          </label>
          <Input
            id="trackingCode"
            type="text"
            value={trackingCode}
            onChange={handleTrackingCodeChange}
            placeholder="Enter tracking code for returning users"
          />
          {wallet && <RewardBadge balance={wallet.balance} />}
          {trackingCodeInvalid && (
            <p className="text-xs text-destructive">
              Invalid format. Expected: TXN + uppercase letters/numbers (e.g.
              TXNABC123XYZ).
            </p>
          )}
          {!trackingCodeInvalid && walletNotFound && (
            <p className="text-xs text-destructive">
              No wallet found for this tracking code.
            </p>
          )}
        </div>

        {/* Quote display */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState size="sm" message="Getting live rate..." />
            </motion.div>
          )}

          {quoteError && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-destructive py-4"
            >
              Failed to get quote. Please try again.
            </motion.div>
          )}

          {quote && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2 rounded-lg bg-muted/50 p-4"
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span>
                  1 {from} ={" "}
                  {quote.rate.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}{" "}
                  {to}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span>
                  {sourceSymbol}{" "}
                  {quote.fee.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ETA</span>
                <span>{ETA_SECONDS}</span>
              </div>
              {quote.discount?.applied && (
                <div className="text-sm text-primary">
                  AFT Discount: -{quote.discount.percent}% fee (
                  {quote.discount.reason})
                </div>
              )}
              {quote.discount &&
                !quote.discount.applied &&
                quote.discount.threshold && (
                  <div className="text-sm text-muted-foreground">
                    {quote.discount.reason}{" "}
                    <span className="text-yellow-600">
                      ({quote.discount.balance?.toFixed(2) ?? "0"}/
                      {quote.discount.threshold} AFT)
                    </span>
                  </div>
                )}
              <hr className="border-border" />
              <div className="flex justify-between font-semibold">
                <span>They receive</span>
                <span>
                  {targetSymbol}{" "}
                  {quote.receiveAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipient section */}
        <div className="space-y-3 pt-2">
          <Tabs
            value={recipientMode}
            onValueChange={(v) =>
              setRecipientMode(v as RecipientMode)
            }
          >
            <TabsList className="w-full">
              <TabsTrigger value="WALLET" className="flex-1">
                ASEANFlow Wallet
              </TabsTrigger>
              <TabsTrigger value="BANK" className="flex-1">
                Bank Account
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <AnimatePresence mode="wait">
            {recipientMode === "WALLET" ? (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-2"
              >
                <label
                  htmlFor="recipientWalletId"
                  className="text-sm font-medium"
                >
                  Recipient Wallet ID
                </label>
                <Input
                  id="recipientWalletId"
                  type="text"
                  value={recipientWalletId}
                  onChange={(e) =>
                    setRecipientWalletId(e.target.value.trim())
                  }
                  placeholder="Enter recipient's wallet ID"
                />
              </motion.div>
            ) : (
              <motion.div
                key="bank"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-2"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="recipientName"
                    className="text-sm font-medium"
                  >
                    Recipient Name
                  </label>
                  <Input
                    id="recipientName"
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full name as on bank account"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank</label>
                  <Select
                    value={recipientBank}
                    onValueChange={setRecipientBank}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDONESIAN_BANKS.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="recipientAccount"
                    className="text-sm font-medium"
                  >
                    Account Number
                  </label>
                  <Input
                    id="recipientAccount"
                    type="text"
                    value={recipientAccount}
                    onChange={(e) =>
                      setRecipientAccount(
                        e.target.value.replace(/\D/g, "").slice(0, 20),
                      )
                    }
                    placeholder="6-20 digit account number"
                    maxLength={20}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {createTransfer.error && (
          <p className="text-sm text-destructive text-center">
            Transfer failed. Please try again.
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleContinue}
          disabled={!isAmountValid || !quote || isSubmitting || !isRecipientValid}
        >
          {isSubmitting ? "Processing..." : "Continue Transfer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 3: Verify frontend compiles**

Run: `cd apps/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/quote-calculator.tsx
git commit -m "feat(web): add recipient mode tabs and fields to quote calculator"
```

---

### Task 8: Display recipient info on transfer timeline page

**Files:**
- Modify: `apps/web/app/transfer/[trackingCode]/page.tsx`

- [ ] **Step 1: Add recipient info display**

In the transfer detail response data section, after the fee row and before `<TransferTimeline>`, add a recipient info block.

Find this code:

```typescript
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-muted-foreground">Fee</span>
                      <span>{CURRENCY_SYMBOLS[transfer.sourceCurrency as keyof typeof CURRENCY_SYMBOLS]}{Number(transfer.fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
```

Replace with:

```typescript
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-muted-foreground">Fee</span>
                      <span>{CURRENCY_SYMBOLS[transfer.sourceCurrency as keyof typeof CURRENCY_SYMBOLS]}{Number(transfer.fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-muted-foreground">Recipient</span>
                      {transfer.recipientType === "WALLET" ? (
                        <span>Wallet •••{transfer.recipientWalletId?.slice(-4) ?? "????"}</span>
                      ) : (
                        <span>{transfer.recipientName} • {transfer.recipientBank} •••{transfer.recipientAccount?.slice(-4) ?? "????"}</span>
                      )}
                    </div>
                  </div>
```

- [ ] **Step 2: Verify frontend compiles**

Run: `cd apps/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/transfer/[trackingCode]/page.tsx
git commit -m "feat(web): display recipient info on transfer timeline page"
```

---

### Task 9: Smoke test the full flow

- [ ] **Step 1: Start dev environment**

Run: `docker compose -f docker-compose.dev.yml up -d && pnpm dev`

- [ ] **Step 2: Test wallet mode**

1. Open `http://localhost:3000/send`
2. Enter amount 1000
3. Select "ASEANFlow Wallet" tab
4. Enter a wallet ID
5. Click "Continue Transfer"
6. Verify redirect to `/transfer/[trackingCode]`
7. Verify recipient shows "Wallet •••XXXX"

- [ ] **Step 3: Test bank mode**

1. Go back to `/send`
2. Enter amount 500
3. Select "Bank Account" tab
4. Enter recipient name, select bank, enter account number
5. Click "Continue Transfer"
6. Verify redirect to `/transfer/[trackingCode]`
7. Verify recipient shows "Name • BANK •••XXXX"

- [ ] **Step 4: Test swap direction (IDR → PHP)**

1. Click swap button to switch to IDR → PHP
2. Verify quote still works
3. Verify recipient fields still functional
