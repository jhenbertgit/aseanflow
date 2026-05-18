name: "PRP 09 — Transfer Timeline: Animated Settlement + Morph Proof"
description: |

  ## Purpose

  Build `/transfer/[id]` page. Polls transfer status every 1s via React Query. Animated Framer Motion timeline, 7 states. Morph proof badge on MORPH_ANCHORED.

  ## Core Principles

  1. **Context is King**: Include ALL docs, examples, caveats
  2. **Validation Loops**: Provide executable tests/lints AI can run + fix
  3. **Information Dense**: Keywords + patterns from codebase
  4. **Progressive Success**: Start simple → validate → enhance
  5. **Global rules**: Follow all rules in CLAUDE.md

  ---

  ## Goal

  Create `/transfer/[trackingCode]` page: animated timeline (7 states), polls `GET /api/transfer/:trackingCode` every 1s via React Query, Framer Motion AnimatePresence for transitions, Morph proof component on MORPH_ANCHORED.

  ## Why

  - **Demo centerpiece**: Animated timeline IS the demo — judges watch transfer progress
  - **Morph showcase**: Morph proof = payoff, visible after settlement
  - **Real-time feel**: Polling + animations feel live

  ## What

  ### User-visible behavior
  - Animated timeline, 7 states
  - States progress: ✓ completed, ⏳ in progress, ⬜ pending
  - Each stage ~1-1.5s visual delay matching simulator timing
  - Morph proof badge + hash appear on completion
  - Transfer details (amounts, rate, fee) visible

  ### Technical requirements
  - Next.js page: `apps/web/app/transfer/[id]/page.tsx`
  - Component: `apps/web/components/transfer-timeline.tsx`
  - Component: `apps/web/components/morph-proof.tsx`
  - React Query polling: `refetchInterval` 1000ms, stops on MORPH_ANCHORED
  - Framer Motion AnimatePresence for state transitions
  - `TransferStatus` enum mapped to timeline steps

  ### Success Criteria

  - [x] Timeline shows all 7 states, correct labels
  - [x] States animate as they progress (AnimatePresence)
  - [x] Polling starts at 1s interval
  - [x] Polling stops on MORPH_ANCHORED
  - [x] Morph proof appears after MORPH_ANCHORED
  - [x] Morph proof shows "Verified on Morph" badge + truncated hash
  - [x] Transfer details visible (send, receive, rate, fee)
  - [x] Handles invalid tracking code gracefully

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://tanstack.com/query/latest
    why: useQuery with refetchInterval for polling
    critical: refetchInterval callback can stop polling conditionally

  - url: https://www.framer.com/motion/
    why: AnimatePresence for mount/unmount, motion.div for transitions

  - doc: Framer Motion
    section: AnimatePresence for timeline state transitions
    critical: Use mode="wait" or mode="popLayout" for smooth transitions

  - url: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
    why: Dynamic route [id] pattern for tracking code
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  apps/web/lib/api/transfer.ts       # From PRP 08 — transfer API client
  apps/web/lib/api/hooks.ts          # From PRP 08 — React Query hooks
  packages/shared/src/types/transfer.ts  # TransferDetailResponse type
  ```

  ### Desired Codebase tree

  ```txt
  apps/web/app/transfer/[id]/page.tsx     # Timeline page
  apps/web/components/transfer-timeline.tsx  # Animated timeline
  apps/web/components/morph-proof.tsx     # Morph proof display
  apps/web/lib/api/hooks.ts              # ADD useTransferStatus hook
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: Poll every 1s — but STOP when MORPH_ANCHORED reached
  // CRITICAL: Framer Motion AnimatePresence for mount/unmount transitions
  // CRITICAL: Transfer state labels must match TransferStatus enum exactly
  // CRITICAL: morphTxHash is null until anchoring completes
  // CRITICAL: Dynamic route [id] maps to tracking code, not database ID
  ```

  ## Implementation Blueprint

  ### Data models and structure

  ```typescript
  // Timeline step definition
  const TIMELINE_STEPS = [
    { status: 'CREATED', label: 'Transfer Created', icon: '📋' },
    { status: 'QUOTE_LOCKED', label: 'Rate Locked', icon: '🔒' },
    { status: 'INSTA_PAY_PROCESSING', label: 'InstaPay Processing', icon: '🏦' },
    { status: 'FX_CONVERSION', label: 'FX Conversion', icon: '💱' },
    { status: 'BI_FAST_PROCESSING', label: 'BI-FAST Processing', icon: '🏦' },
    { status: 'SETTLED', label: 'Settled', icon: '✅' },
    { status: 'MORPH_ANCHORED', label: 'Proof Anchored', icon: '⛓️' },
  ] as const;
  ```

  ### List of tasks

  ```yaml
  Task 9.1 — Transfer Status Hook:
    MODIFY apps/web/lib/api/hooks.ts:
      - ADD useTransferStatus(trackingCode: string)
      - useQuery with queryKey: ['transfer', trackingCode]
      - queryFn: GET /api/transfer/:trackingCode
      - refetchInterval: (query) => query.state.data?.status === 'MORPH_ANCHORED' ? false : 1000
      - STOP polling when MORPH_ANCHORED

  Task 9.2 — Timeline Component:
    CREATE apps/web/components/transfer-timeline.tsx:
      - 'use client' directive
      - DEFINE TIMELINE_STEPS array with status, label, icon
      - MAP steps to visual timeline items
      - THREE states per step: completed (✓ green), active (⏳ pulse), pending (⬜ gray)
      - USE Framer Motion for step transitions
      - AnimatePresence for entering/exiting active indicators
      - EACH step shows label + optional detail (instapayRef, bifastRef)

  Task 9.3 — Morph Proof Component:
    CREATE apps/web/components/morph-proof.tsx:
      - 'use client' directive
      - SHOW only when morphTxHash is present
      - DISPLAY "Verified on Morph" badge (green, prominent)
      - DISPLAY morphTxHash truncated: 0xabc123...def456
      - SUCCESS animation (scale + glow effect)
      - COPY button for full hash (optional)

  Task 9.4 — Transfer Page:
    CREATE apps/web/app/transfer/[id]/page.tsx:
      - EXTRACT trackingCode from params
      - USE useTransferStatus(trackingCode) hook
      - DISPLAY transfer details: send amount, receive amount, rate, fee
      - RENDER TransferTimeline component
      - RENDER MorphProof component (conditional on morphTxHash)
      - HANDLE loading state
      - HANDLE not found error (invalid tracking code)

  Task 9.5 — Verify Full Flow:
    RUN full demo: landing → send → timeline → morph proof
    CHECK animations smooth, polling correct, proof displays
  ```

  ### Per task pseudocode

  ```typescript
  // Task 9.1 — Hook
  export function useTransferStatus(trackingCode: string) {
    return useQuery({
      queryKey: ['transfer', trackingCode],
      queryFn: async () => {
        const res = await fetch(`${API_BASE}/api/transfer/${trackingCode}`);
        if (!res.ok) throw new Error('Transfer not found');
        return res.json() as Promise<TransferDetailResponse>;
      },
      refetchInterval: (query) => {
        if (query.state.data?.status === 'MORPH_ANCHORED') return false;
        return 1000;
      },
      enabled: !!trackingCode,
    });
  }

  // Task 9.2 — Timeline
  export function TransferTimeline({ currentStatus }: { currentStatus: string }) {
    const currentIndex = TIMELINE_STEPS.findIndex(s => s.status === currentStatus);

    return (
      <div className="space-y-4">
        {TIMELINE_STEPS.map((step, index) => (
          <motion.div
            key={step.status}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 ${
              index <= currentIndex ? 'text-green-500' : 'text-gray-400'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < currentIndex ? 'bg-green-500 text-white' :
              index === currentIndex ? 'bg-blue-500 text-white animate-pulse' :
              'bg-gray-200'
            }`}>
              {index < currentIndex ? '✓' : index === currentIndex ? '⏳' : index + 1}
            </div>
            <span className="font-medium">{step.label}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  // Task 9.3 — Morph Proof
  export function MorphProof({ txHash }: { txHash: string }) {
    const truncated = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-4 border-2 border-green-500 rounded-lg bg-green-50"
      >
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500">Verified on Morph</Badge>
        </div>
        <p className="mt-2 font-mono text-sm">{truncated}</p>
      </motion.div>
    );
  }
  ```

  ### Integration Points

  ```yaml
  API:
    - GET /api/transfer/:trackingCode → TransferService.getByTrackingCode (PRP 03)

  ROUTES:
    - /transfer/[id] → this page (id = tracking code)
    - Navigated from /send after transfer creation

  COMPONENTS:
    - uses: framer-motion for animations
    - uses: @aseanflow/ui Badge component
  ```

  ## Validation Loop

  ### Level 1: Syntax & Style

  ```bash
  pnpm lint
  pnpm format
  cd apps/web && pnpm typecheck
  # Expected: No errors
  ```

  ### Level 2: Full Flow Test

  ```bash
  pnpm dev  # web + api + worker
  # 1. Open http://localhost:3000/send
  # 2. Enter 1000 PHP → click Continue Transfer
  # 3. Watch timeline animate through all states
  # 4. Verify Morph proof appears at end
  # 5. Verify polling stops after MORPH_ANCHORED
  # Expected: Full flow completes in ~10 seconds
  ```

  ## Final Validation Checklist

  - [x] No linting errors: `pnpm lint`
  - [x] TypeScript clean: `cd apps/web && pnpm typecheck`
  - [x] Timeline animates through all 7 states
  - [x] Polling stops on MORPH_ANCHORED
  - [x] Morph proof displays with badge + hash
  - [x] Invalid tracking code shows error
  - [ ] No layout shifts during animation

  ---

  ## Anti-Patterns to Avoid

  - Do NOT poll indefinitely — stop on MORPH_ANCHORED
  - Do NOT use setInterval — use React Query refetchInterval
  - Do NOT skip AnimatePresence — needed for smooth transitions
  - Do NOT show Morph proof before MORPH_ANCHORED
  - Do NOT use database ID in URL — use tracking code

  ## Dependencies

  - [PRP 03 — Transfer API](./prp_03_transfer_api.md) (GET transfer endpoint)
  - [PRP 08 — Quote Calculator](./prp_08_quote_calculator.md) (Redirects here after create)

  ## Next PRP

  [PRP 10 — Demo Page, Docker, Polish](./prp_10_demo_docker_polish.md)

Compressed. Most text was already terse spec language — trimmed filler phrases, tightened descriptions, preserved all code/URLs/structure untouched.