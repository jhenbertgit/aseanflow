name: "PRP 05 — Workers & Events: BullMQ Processors + Domain Events ✅ DONE"
description: |

  ## Purpose

  BullMQ workers for settlement + morph-anchor jobs. Domain events via NestJS EventEmitter2. Workers run as separate process — NOT in NestJS API process.

  ## Core Principles

  1. **Context is King**: Include ALL docs, examples, caveats
  2. **Validation Loops**: Executable tests/lints AI can run + fix
  3. **Information Dense**: Keywords + patterns from codebase
  4. **Progressive Success**: Start simple → validate → enhance
  5. **Global rules**: Follow all rules in CLAUDE.md

  ---

  ## Goal

  Standalone BullMQ worker app processing settlement + morph-anchor jobs. Domain events (`transfer.status.changed`, `transfer.settled`) via NestJS EventEmitter2. Settlement queue wired into transfer creation flow.

  ## Why

  - **Critical architecture**: BullMQ workers MUST be separate process from NestJS API
  - **Async Morph anchoring**: Settlement completes → queues morph-anchor → worker picks up
  - **Decoupling**: Events enable UI updates + Morph anchoring without blocking settlement

  ## What

  ### User-visible behavior
  - Transfer creation triggers settlement pipeline automatically
  - Settlement progresses through states without blocking API response
  - Morph anchoring happens async after settlement completes

  ### Technical requirements
  - BullMQ queues: `settlement` and `morph-anchor`
  - Worker app at `apps/worker/` — standalone Node.js process
  - Domain events via NestJS EventEmitter2
  - Settlement worker calls SettlementService.orchestrate()
  - Morph-anchor worker calls MorphService.anchorProof() (from PRP 06)
  - Transfer controller queues settlement job on POST /api/transfer

  ### Success Criteria

  - [x] Settlement queue processes transfer through all states
  - [x] Morph-anchor queue processes proof after SETTLED
  - [x] Worker runs as separate process (not in API process)
  - [x] Domain events emitted on status changes
  - [x] Transfer controller queues settlement on create
  - [x] Docker Compose includes worker service

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://docs.bullmq.io/
    why: Queue, Worker, Processor patterns, connection setup

  - url: https://docs.nestjs.com/techniques/events
    why: EventEmitter2 integration in NestJS
    critical: Use @nestjs/event-emitter, NOT Node.js built-in EventEmitter
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  apps/api/src/modules/settlement/settlement.service.ts  # From PRP 04
  apps/api/src/modules/transfer/transfer.controller.ts   # From PRP 03
  apps/api/src/modules/transfer/transfer.service.ts      # From PRP 03
  packages/redis/src/                                     # Redis client config
  ```

  ### Desired Codebase tree

  ```txt
  apps/api/src/events/
  └── transfer.events.ts               # Domain event definitions

  apps/api/src/workers/
  └── settlement.worker.ts             # Settlement BullMQ processor (NestJS-registered)

  apps/worker/
  ├── src/
  │   ├── main.ts                      # Worker entry point
  │   ├── settlement.processor.ts      # Settlement job processor
  │   └── morph-anchor.processor.ts    # Morph anchor job processor
  ├── package.json
  └── tsconfig.json
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: BullMQ requires separate worker process — do NOT run workers in NestJS process
  // CRITICAL: NestJS EventEmitter2 for domain events — NOT Node.js EventEmitter
  // CRITICAL: Morph MUST NOT be in critical path — always async via BullMQ worker
  // CRITICAL: Worker needs its own Redis connection, same instance as API
  ```

  ## Implementation Blueprint

  ### Data models and structure

  ```typescript
  // Event definitions
  export const TransferEvents = {
    STATUS_CHANGED: 'transfer.status.changed',
    SETTLED: 'transfer.settled',
  } as const;

  export interface TransferStatusChangedEvent {
    transferId: string;
    oldStatus: string;
    newStatus: string;
    timestamp: number;
  }

  export interface TransferSettledEvent {
    transferId: string;
    trackingCode: string;
    timestamp: number;
  }
  ```

  ### List of tasks

  ```yaml
  Task 5.1 — Domain Events:
    CREATE apps/api/src/events/transfer.events.ts:
      - DEFINE TransferEvents constant with event names
      - DEFINE event payload interfaces
      - USE NestJS EventEmitter2 via @nestjs/event-emitter

  Task 5.2 — Settlement Worker (in NestJS):
    CREATE apps/api/src/workers/settlement.worker.ts:
      - REGISTER BullMQ processor for 'settlement' queue
      - ON job: CALL SettlementService.orchestrate(transferId)
      - HANDLE errors with retry logic

  Task 5.3 — Standalone Worker App:
    CREATE apps/worker/package.json:
      - DEPEND on @aseanflow/shared, bullmq, ioredis
      - ADD start script

    CREATE apps/worker/tsconfig.json:
      - EXTEND from @aseanflow/tsconfig

    CREATE apps/worker/src/main.ts:
      - SET UP BullMQ worker connections to Redis
      - REGISTER settlement and morph-anchor processors
      - LOG worker startup

    CREATE apps/worker/src/settlement.processor.ts:
      - IMPLEMENT BullMQ processor for 'settlement' queue
      - ON job: instantiate NestJS context or direct service call
      - HANDLE errors with retry

    CREATE apps/worker/src/morph-anchor.processor.ts:
      - IMPLEMENT BullMQ processor for 'morph-anchor' queue
      - ON job: call MorphService.anchorProof (PRP 06)
      - ON complete: advanceStatus → MORPH_ANCHORED

  Task 5.4 — Wire Transfer Create to Settlement:
    MODIFY apps/api/src/modules/transfer/transfer.controller.ts:
      - AFTER createTransfer: queue settlement job
      - POST /api/transfer returns immediately, settlement runs async

  Task 5.5 — Register in Docker:
    MODIFY docker-compose.dev.yml (if needed):
      - ENSURE worker service can connect to redis
  ```

  ### Per task pseudocode

  ```typescript
  // Task 5.1 — Events
  import { TransferEvents } from './transfer.events';

  // In TransferService.advanceStatus:
  this.eventEmitter.emit(TransferEvents.STATUS_CHANGED, {
    transferId,
    oldStatus: transfer.status,
    newStatus,
    timestamp: Date.now(),
  });

  // Task 5.3 — Standalone worker
  // apps/worker/src/main.ts
  import { Worker } from 'bullmq';
  import { settlementProcessor } from './settlement.processor';
  import { morphAnchorProcessor } from './morph-anchor.processor';

  const connection = { host: process.env.REDIS_HOST || 'localhost', port: 6379 };

  const settlementWorker = new Worker('settlement', settlementProcessor, { connection });
  const morphWorker = new Worker('morph-anchor', morphAnchorProcessor, { connection });

  console.log('Workers started...');

  // Task 5.4 — Controller wiring
  // In TransferController.createTransfer:
  @Post()
  async create(@Body() dto: CreateTransferDto) {
    const result = await this.transferService.createTransfer(dto);
    // Queue settlement job — don't await
    await this.settlementQueue.add('settle', { transferId: result.trackingCode });
    return result;
  }
  ```

  ### Integration Points

  ```yaml
  REDIS:
    - queues: "settlement, morph-anchor"
    - connection: "Same Redis instance as API cache"

  BULLMQ:
    - queue: "settlement — added by TransferController on create"
    - queue: "morph-anchor — added by SettlementService after SETTLED"

  EVENTS:
    - emit: "transfer.status.changed — consumed by future WebSocket/SSE"
    - emit: "transfer.settled — consumed by morph-anchor trigger"
  ```

  ## Validation Loop

  ### Level 1: Syntax & Style

  ```bash
  pnpm lint
  pnpm format
  # Expected: No errors
  ```

  ### Level 2: Manual Worker Test

  ```bash
  # Start services
  docker-compose -f docker-compose.dev.yml up -d
  pnpm dev  # API

  # In separate terminal, start worker
  cd apps/worker && pnpm start

  # Create transfer
  curl -X POST http://localhost:3001/api/transfer \
    -H "Content-Type: application/json" \
    -d '{"amount": 1000, "from": "PHP", "to": "IDR"}'
  # Expected: {"trackingCode": "TXN...", "status": "CREATED"}

  # Poll status — should advance through states
  curl http://localhost:3001/api/transfer/TXN...
  # Expected: Status progresses through SETTLED over ~5-7 seconds
  ```

  ## Final Validation Checklist

  - [x] Worker starts without errors: `cd apps/worker && pnpm start`
  - [x] Settlement queue processes jobs
  - [x] Morph-anchor queue processes jobs after SETTLED
  - [x] No linting errors: `pnpm lint`
  - [x] Worker runs as separate process

  ---

  ## Anti-Patterns to Avoid

  - Do NOT run workers in the NestJS API process — separate process
  - Do NOT use Node.js EventEmitter — use @nestjs/event-emitter (EventEmitter2)
  - Do NOT await morph-anchor in settlement flow — queue it
  - Do NOT create microservices — worker is a thin BullMQ wrapper

  ## Dependencies

  - [PRP 03 — Transfer API](./prp_03_transfer_api.md) (TransferController, TransferService)
  - [PRP 04 — Settlement](./prp_04_settlement.md) (SettlementService, simulators)

  ## Next PRP

  [PRP 06 — Morph Integration](./prp_06_morph.md)