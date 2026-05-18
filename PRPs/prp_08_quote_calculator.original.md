name: "PRP 08 — Quote Calculator: Send Page + FX Form"
description: |

  ## Purpose

  Build the quote calculator page at /send. PHP amount input → live IDR conversion via React Query → "Continue Transfer" creates transfer and redirects to timeline.

  ## Core Principles

  1. **Context is King**: Include ALL necessary documentation, examples, and caveats
  2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
  3. **Information Dense**: Use keywords and patterns from the codebase
  4. **Progressive Success**: Start simple, validate, then enhance
  5. **Global rules**: Be sure to follow all rules in CLAUDE.md

  ---

  ## Goal

  Create /send page with: PHP amount input, live IDR conversion display (via React Query calling POST /api/quote), fee display (₱10), ETA display (~10 sec), "Continue Transfer" button that creates transfer via POST /api/transfer and redirects to /transfer/[trackingCode].

  ## Why

  - **Core user flow**: This is where the payment experience begins
  - **Live feedback**: User sees conversion in real-time as they type
  - **React Query pattern**: Demonstrates proper data fetching with caching

  ## What

  ### User-visible behavior
  - Enter PHP amount → see IDR receive amount update
  - See fee (₱10) and ETA (~10 sec) displayed
  - Click "Continue Transfer" → redirect to timeline page

  ### Technical requirements
  - Next.js page: apps/web/app/send/page.tsx
  - Component: apps/web/components/quote-calculator.tsx
  - API client: apps/web/lib/api/quote.ts + apps/web/lib/api/transfer.ts
  - React Query hooks: apps/web/lib/api/hooks.ts
  - Zod validation on client side
  - Debounced input for quote API calls

  ### Success Criteria

  - [ ] PHP amount input accepts numeric values
  - [ ] IDR conversion updates as user types (debounced)
  - [ ] Fee ₱10 displayed
  - [ ] ETA ~10 sec displayed
  - [ ] "Continue Transfer" creates transfer via API
  - [ ] Redirects to /transfer/[trackingCode] on success
  - [ ] Error handling for invalid amounts
  - [ ] React Query for API calls with proper cache/loading states

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://tanstack.com/query/latest
    why: useQuery, useMutation hooks, caching, loading states

  - url: https://ui.shadcn.com/
    why: Input, Button, Card components

  - doc: React Hook Form (optional)
    why: Form state management — can also use simple useState
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  apps/web/app/page.tsx                    # From PRP 07 — landing page links here
  packages/shared/src/types/transfer.ts    # QuoteResponse, CreateTransferRequest types
  ```

  ### Desired Codebase tree

  ```txt
  apps/web/app/send/page.tsx               # Send page
  apps/web/components/quote-calculator.tsx # FX quote form
  apps/web/lib/api/quote.ts                # Quote API client
  apps/web/lib/api/transfer.ts             # Transfer API client
  apps/web/lib/api/hooks.ts                # React Query hooks
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: Debounce input — don't call API on every keystroke
  // CRITICAL: Validate amount client-side before API call
  // CRITICAL: React Query loading/error states must be handled in UI
  // CRITICAL: redirect uses Next.js router.push, not window.location
  ```

  ## Implementation Blueprint

  ### List of tasks

  ```yaml
  Task 8.1 — API Clients:
    CREATE apps/web/lib/api/quote.ts:
      - IMPLEMENT getQuote(amount, from, to)
      - POST to /api/quote
      - RETURN QuoteResponse

    CREATE apps/web/lib/api/transfer.ts:
      - IMPLEMENT createTransfer(amount, from, to)
      - POST to /api/transfer
      - RETURN TransferResponse (trackingCode + status)

  Task 8.2 — React Query Hooks:
    CREATE apps/web/lib/api/hooks.ts:
      - IMPLEMENT useQuote(amount) — useQuery with debounce
        - ENABLED only when amount > 0
        - STALE_TIME short since rate can change
      - IMPLEMENT useCreateTransfer() — useMutation
        - onSuccess: redirect to /transfer/[trackingCode]

  Task 8.3 — Quote Calculator Component:
    CREATE apps/web/components/quote-calculator.tsx:
      - 'use client' directive
      - INPUT: PHP amount (numeric, validated 1-1,000,000)
      - DISPLAY: IDR receiveAmount (from useQuote hook)
      - DISPLAY: Fee ₱10, ETA ~10 sec
      - CTA: "Continue Transfer" button → useCreateTransfer mutation
      - LOADING state while API call in progress
      - ERROR state for invalid amounts or API errors

  Task 8.4 — Send Page:
    CREATE apps/web/app/send/page.tsx:
      - IMPORT QuoteCalculator component
      - WRAP in layout with header/back navigation
      - PROVIDE React Query context
  ```

  ### Per task pseudocode

  ```typescript
  // Task 8.1 — API clients
  // apps/web/lib/api/quote.ts
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  export async function getQuote(amount: number, from: string, to: string) {
    const res = await fetch(`${API_BASE}/api/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, from, to }),
    });
    if (!res.ok) throw new Error('Quote failed');
    return res.json(); // QuoteResponse
  }

  // apps/web/lib/api/transfer.ts
  export async function createTransfer(amount: number, from: string, to: string) {
    const res = await fetch(`${API_BASE}/api/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, from, to }),
    });
    if (!res.ok) throw new Error('Transfer creation failed');
    return res.json(); // TransferResponse
  }

  // Task 8.2 — Hooks
  // apps/web/lib/api/hooks.ts
  import { useQuery, useMutation } from '@tanstack/react-query';

  export function useQuote(amount: number) {
    return useQuery({
      queryKey: ['quote', amount],
      queryFn: () => getQuote(amount, 'PHP', 'IDR'),
      enabled: amount > 0 && amount <= 1000000,
      staleTime: 10_000, // 10s
    });
  }

  export function useCreateTransfer() {
    const router = useRouter();
    return useMutation({
      mutationFn: (amount: number) => createTransfer(amount, 'PHP', 'IDR'),
      onSuccess: (data) => {
        router.push(`/transfer/${data.trackingCode}`);
      },
    });
  }

  // Task 8.3 — Component
  // apps/web/components/quote-calculator.tsx
  'use client';
  export function QuoteCalculator() {
    const [amount, setAmount] = useState(1000);
    const { data: quote, isLoading } = useQuote(amount);
    const createTransfer = useCreateTransfer();

    return (
      <Card>
        <Input type="number" value={amount} onChange={...} />
        {quote && (
          <div>
            <p>You send: ₱{amount}</p>
            <p>They receive: Rp {quote.receiveAmount.toLocaleString()}</p>
            <p>Fee: ₱{quote.fee}</p>
            <p>Rate: {quote.rate}</p>
            <p>ETA: ~10 seconds</p>
          </div>
        )}
        <Button onClick={() => createTransfer.mutate(amount)}>
          Continue Transfer
        </Button>
      </Card>
    );
  }
  ```

  ### Integration Points

  ```yaml
  API:
    - POST /api/quote → FxService.calculateQuote (PRP 02)
    - POST /api/transfer → TransferService.createTransfer (PRP 03)

  ROUTES:
    - /send → this page
    - /transfer/[trackingCode] → PRP 09 timeline page

  SHARED_TYPES:
    - QuoteResponse, TransferResponse from @aseanflow/shared
  ```

  ## Validation Loop

  ### Level 1: Syntax & Style

  ```bash
  pnpm lint
  pnpm format
  cd apps/web && pnpm typecheck
  # Expected: No errors
  ```

  ### Level 2: Visual + Functional Test

  ```bash
  pnpm dev  # both web + api
  # Open http://localhost:3000/send
  # Enter 1000 → see IDR conversion
  # Click Continue → redirect to /transfer/TXN...
  ```

  ## Final Validation Checklist

  - [ ] No linting errors: `pnpm lint`
  - [ ] TypeScript clean: `cd apps/web && pnpm typecheck`
  - [ ] Quote updates on amount change
  - [ ] Transfer creates and redirects
  - [ ] Loading/error states work
  - [ ] No console errors

  ---

  ## Anti-Patterns to Avoid

  - Do NOT call API on every keystroke — debounce
  - Do NOT skip loading/error states
  - Do NOT use window.location for redirect — use Next.js router
  - Do NOT validate only server-side — validate client too
  - Do NOT hardcode API URL — use env var

  ## Dependencies

  - [PRP 02 — FX Engine](./prp_02_fx_engine.md) (Quote API)
  - [PRP 03 — Transfer API](./prp_03_transfer_api.md) (Transfer API)
  - [PRP 07 — Landing Page](./prp_07_landing_page.md) (Links to /send)

  ## Next PRP

  [PRP 09 — Transfer Timeline](./prp_09_transfer_timeline.md)
