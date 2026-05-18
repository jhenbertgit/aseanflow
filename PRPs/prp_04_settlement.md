name: "PRP 04 — Settlement Simulators: InstaPay + BI-FAST + Ledger"
description: |

  ## Purpose

  Build settlement simulators (InstaPay PHP, BI-FAST IDR), orchestration service, double-entry ledger. Realistic 1000-1500ms rail delays.

  ## Core Principles

  1. **Context is King**: Include ALL docs, examples, caveats
  2. **Validation Loops**: Executable tests/lints AI can run+fix
  3. **Information Dense**: Codebase keywords/patterns
  4. **Progressive Success**: Simple → validate → enhance
  5. **Global rules**: Follow all rules in CLAUDE.md

  ---

  ## Goal

  Create InstaPay/BI-FAST simulators w/ realistic delays, SettlementService orchestrating full flow through all states, LedgerService for double-entry bookkeeping.

  ## Why

  - **Demo value**: Simulated rails show "SWIFT-free" concept in action
  - **State machine**: Settlement drives transfer through all statuses
  - **Audit trail**: Double-entry ledger = financial integrity proof

  ## What

  ### User-visible behavior
  - Transfer progresses animated: QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION → BI_FAST_PROCESSING → SETTLED

  ### Technical requirements
  - InstaPay simulator: 1000-1500ms delay, returns `{ status: 'SUCCESS', reference: 'IPS...' }`
  - BI-FAST simulator: 1000-1500ms delay, returns `{ status: 'SUCCESS', reference: 'BIF...' }`
  - SettlementService: orchestrates full flow, advances state per step, queues morph-anchor after SETTLED
  - LedgerService: creates debit (PHP) + credit (IDR) entries per transfer

  ### Success Criteria

  - [x] InstaPay simulator completes in 1000-1500ms
  - [x] BI-FAST simulator completes in 1000-1500ms
  - [x] SettlementService advances through all states in correct order
  - [x] instapayRef and bifastRef stored on transfer record
  - [x] LedgerService creates debit and credit entries
  - [x] Morph-anchor job queued after SETTLED (not awaited)
  - [x] Events emitted at each status change
  - [x] Unit tests pass for simulators and orchestration

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://docs.nestjs.com/providers#services
    why: Injectable service pattern

  - doc: TransferStatus enum
    why: State machine order — CREATED → QUOTE_LOCKED → INSTA_PAY_PROCESSING → FX_CONVERSION → BI_FAST_PROCESSING → SETTLED → MORPH_ANCHORED
    critical: Never skip states, never go backwards
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  apps/api/src/modules/transfer/transfer.service.ts  # From PRP 03 — advanceStatus
  packages/database/prisma/schema.prisma              # Transfer, LedgerEntry models
  ```

  ### Desired Codebase tree

  ```txt
  apps/api/src/modules/settlement/
  ├── settlement.module.ts              # NestJS module
  ├── settlement.service.ts             # Orchestration logic
  ├── settlement.service.spec.ts        # Unit tests
  ├── instapay.simulator.ts             # InstaPay domestic rail simulator
  └── bifast.simulator.ts               # BI-FAST domestic rail simulator

  apps/api/src/modules/ledger/
  ├── ledger.module.ts                  # NestJS module
  ├── ledger.service.ts                 # Double-entry logic
  └── ledger.service.spec.ts            # Unit tests
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: InstaPay/BI-FAST simulators use realistic delay (1000-1500ms) — do NOT fake instant success
  // CRITICAL: Transfer state machine — never skip states, never go backwards
  // CRITICAL: Morph MUST NOT be in critical path — queue morph-anchor, don't await
  // CRITICAL: Prisma Decimal for money amounts
  // CRITICAL: LedgerEntry needs both debit (PHP) and credit (IDR) per transfer
  ```

  ## Implementation Blueprint

  ### Data models and structure

  ```typescript
  // Simulator result
  interface SimulationResult {
    status: 'SUCCESS' | 'FAILED';
    reference: string;
    timestamp: number;
  }

  // Ledger entry pair
  interface LedgerEntryPair {
    debit: { amount: number; currency: 'PHP' };   // Source side
    credit: { amount: number; currency: 'IDR' };   // Target side
  }
  ```

  ### List of tasks

  ```yaml
  Task 4.1 — InstaPay Simulator:
    CREATE apps/api/src/modules/settlement/instapay.simulator.ts:
      - IMPLEMENT simulate(): Promise<SimulationResult>
      - ASYNC delay 1000-1500ms (random within range)
      - RETURN { status: 'SUCCESS', reference: 'IPS' + random 8 chars, timestamp }
      - PATTERN: Use async/await with setTimeout wrapped in promise

  Task 4.2 — BI-FAST Simulator:
    CREATE apps/api/src/modules/settlement/bifast.simulator.ts:
      - IMPLEMENT simulate(): Promise<SimulationResult>
      - ASYNC delay 1000-1500ms (random within range)
      - RETURN { status: 'SUCCESS', reference: 'BIF' + random 8 chars, timestamp }
      - SAME pattern as instapay.simulator

  Task 4.3 — Settlement Service:
    CREATE apps/api/src/modules/settlement/settlement.service.ts:
      - INJECT TransferService, InstapaySimulator, BifastSimulator, EventEmitter2
      - INJECT BullMQ Queue for morph-anchor
      - IMPLEMENT orchestrate(transferId: string): Promise<void>
        - advanceStatus → QUOTE_LOCKED
        - instapay.simulate → store instapayRef → advanceStatus → INSTA_PAY_PROCESSING
        - advanceStatus → FX_CONVERSION
        - bifast.simulate → store bifastRef → advanceStatus → BI_FAST_PROCESSING
        - advanceStatus → SETTLED
        - Queue morph-anchor job (DO NOT await)
      - EMIT events at each stage

  Task 4.4 — Settlement Module:
    CREATE apps/api/src/modules/settlement/settlement.module.ts:
      - REGISTER SettlementModule
      - IMPORT TransferModule, LedgerModule
      - PROVIDE InstapaySimulator, BifastSimulator, SettlementService
      - REGISTER BullMQ morph-anchor queue

  Task 4.5 — Ledger Service:
    CREATE apps/api/src/modules/ledger/ledger.service.ts:
      - INJECT PrismaService
      - IMPLEMENT createEntries(transferId, sendAmount, receiveAmount, fee)
      - CREATE debit entry (PHP): sendAmount
      - CREATE credit entry (IDR): receiveAmount
      - PERSIST both as LedgerEntry records linked to transfer

  Task 4.6 — Ledger Module:
    CREATE apps/api/src/modules/ledger/ledger.module.ts:
      - REGISTER LedgerModule
      - PROVIDE LedgerService

  Task 4.7 — Unit Tests:
    CREATE apps/api/src/modules/settlement/settlement.service.spec.ts:
      - TEST simulator delay is in 1000-1500ms range
      - TEST simulator returns SUCCESS with correct reference format
      - TEST orchestration advances through all states in order
      - TEST morph-anchor job queued after SETTLED
      - TEST events emitted at each stage

    CREATE apps/api/src/modules/ledger/ledger.service.spec.ts:
      - TEST creates debit and credit entries
      - TEST entries linked to correct transfer
  ```

  ### Per task pseudocode

  ```typescript
  // Task 4.1/4.2 — Simulators
  @Injectable()
  export class InstapaySimulator {
    async simulate(): Promise<SimulationResult> {
      const delay = 1000 + Math.random() * 500; // 1000-1500ms
      await new Promise(resolve => setTimeout(resolve, delay));
      return {
        status: 'SUCCESS',
        reference: 'IPS' + randomBytes(4).toString('hex').toUpperCase(),
        timestamp: Date.now(),
      };
    }
  }
  // BifastSimulator — same pattern, prefix 'BIF'

  // Task 4.3 — SettlementService
  @Injectable()
  export class SettlementService {
    constructor(
      private transferService: TransferService,
      private instapay: InstapaySimulator,
      private bifast: BifastSimulator,
      private morphQueue: Queue, // BullMQ 'morph-anchor' queue
      private eventEmitter: EventEmitter2,
    ) {}

    async orchestrate(transferId: string): Promise<void> {
      // CRITICAL: Never skip states. Each advanceStatus emits event.
      await this.transferService.advanceStatus(transferId, 'QUOTE_LOCKED');

      const instapayResult = await this.instapay.simulate();
      // Store instapayRef on transfer
      await this.transferService.advanceStatus(transferId, 'INSTA_PAY_PROCESSING');

      await this.transferService.advanceStatus(transferId, 'FX_CONVERSION');

      const bifastResult = await this.bifast.simulate();
      // Store bifastRef on transfer
      await this.transferService.advanceStatus(transferId, 'BI_FAST_PROCESSING');

      await this.transferService.advanceStatus(transferId, 'SETTLED');

      // CRITICAL: Morph is async — queue, don't await
      await this.morphQueue.add('anchor', { transferId });
    }
  }

  // Task 4.5 — LedgerService
  @Injectable()
  export class LedgerService {
    constructor(private prisma: PrismaService) {}

    async createEntries(transferId: string, sendAmount: number, receiveAmount: number, fee: number) {
      // Debit entry (PHP) — money leaving sender
      await this.prisma.ledgerEntry.create({
        data: { transferId, debit: sendAmount, credit: 0, currency: 'PHP' },
      });
      // Credit entry (IDR) — money arriving at receiver
      await this.prisma.ledgerEntry.create({
        data: { transferId, debit: 0, credit: receiveAmount, currency: 'IDR' },
      });
    }
  }
  ```

  ### Integration Points

  ```yaml
  EVENTS:
    - emit: "transfer.status.changed at each stage"
    - emit: "transfer.settled when reaching SETTLED status"

  BULLMQ:
    - queue: "morph-anchor — add job after SETTLED"

  DATABASE:
    - update: "Transfer.instapayRef, Transfer.bifastRef — store rail references"
    - create: "LedgerEntry records — debit + credit per transfer"
  ```

  ## Validation Loop

  ### Level 1: Syntax & Style

  ```bash
  pnpm lint
  pnpm format
  # Expected: No errors
  ```

  ### Level 2: Unit Tests

  ```typescript
  describe('SettlementService', () => {
    it('advances through all states in order', async () => {
      // Verify state machine transitions: CREATED → QUOTE_LOCKED → ... → SETTLED
    });

    it('queues morph-anchor after SETTLED', async () => {
      // Verify BullMQ add called with { transferId }
    });

    it('stores rail references on transfer', async () => {
      // Verify instapayRef and bifastRef saved
    });
  });

  describe('InstapaySimulator', () => {
    it('returns SUCCESS with IPS reference', async () => {
      const result = await simulator.simulate();
      expect(result.status).toBe('SUCCESS');
      expect(result.reference).toMatch(/^IPS/);
    });
  });

  describe('LedgerService', () => {
    it('creates debit and credit entries', async () => {
      await service.createEntries('transfer-id', 1000, 286308, 10);
      // Verify 2 LedgerEntry records created
    });
  });
  ```

  ```bash
  cd apps/api && pnpm test -- --verbose
  # Expected: All tests pass
  ```

  ## Final Validation Checklist

  - [x] All tests pass: `cd apps/api && pnpm test -- --verbose`
  - [x] No linting errors: `pnpm lint`
  - [x] Simulators delay 1000-1500ms (not instant)
  - [x] Orchestration advances linearly through all states
  - [x] Morph-anchor queued (not awaited) after SETTLED
  - [x] Ledger creates paired debit/credit entries

  ---

  ## Anti-Patterns to Avoid

  - Do NOT fake instant success — realistic 1000-1500ms delays
  - Do NOT skip states in state machine
  - Do NOT await morph-anchor — queue it async
  - Do NOT create microservices — NestJS modules only
  - Do NOT use setTimeout without promise wrapper

  ## Dependencies

  - [PRP 01 — Project Setup](./prp_01_project_setup.md) (Prisma schema)
  - [PRP 03 — Transfer API](./prp_03_transfer_api.md) (TransferService, advanceStatus)

  ## Next PRP

  [PRP 05 — Workers & Events](./prp_05_workers_events.md)