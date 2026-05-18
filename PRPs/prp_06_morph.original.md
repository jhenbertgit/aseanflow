name: "PRP 06 — Morph Integration: Proof Generation + Async Anchoring"
description: |

  ## Purpose

  Integrate Morph blockchain for immutable settlement proofs. Generate SHA-256 proof hashes and anchor them on Morph chain asynchronously via BullMQ worker. Morph is NEVER in the critical settlement path.

  ## Core Principles

  1. **Context is King**: Include ALL necessary documentation, examples, and caveats
  2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
  3. **Information Dense**: Use keywords and patterns from the codebase
  4. **Progressive Success**: Start simple, validate, then enhance
  5. **Global rules**: Be sure to follow all rules in CLAUDE.md

  ---

  ## Goal

  Create MorphService that generates deterministic SHA-256 proof hashes from transfer data and submits them to Morph chain. Anchoring runs in BullMQ worker after settlement completes. Store morphTxHash on transfer record. Advance status to MORPH_ANCHORED on completion.

  ## Why

  - **Morph integration requirement**: Hackathon requires meaningful Morph usage
  - **Immutable proofs**: Settlement proofs verifiable on-chain without compromising speed
  - **Async by design**: Anchoring never blocks settlement — judges see speed + trust

  ## What

  ### User-visible behavior
  - After SETTLED status, transfer eventually shows MORPH_ANCHORED
  - Morph proof hash and txHash displayed in UI

  ### Technical requirements
  - MorphService: generateProof() and anchorProof()
  - SHA-256 hash of deterministic JSON payload
  - Submit proof to Morph chain via Morph SDK
  - Store morphTxHash on transfer record
  - Advance status to MORPH_ANCHORED on completion
  - All async via BullMQ worker

  ### Success Criteria

  - [ ] generateProof produces deterministic SHA-256 hash
  - [ ] Same transfer data always produces same hash
  - [ ] anchorProof submits to Morph chain
  - [ ] morphTxHash stored on transfer record
  - [ ] Status advances to MORPH_ANCHORED after anchoring
  - [ ] Morph anchoring does NOT block settlement
  - [ ] Unit tests pass for proof generation

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://morphl2.io/
    why: Morph SDK for anchoring settlement proofs

  - url: https://docs.morphl2.io/
    why: Morph chain RPC, proof submission API
    critical: Morph is L2 — use correct RPC URL and chain ID

  - doc: Node.js crypto
    section: createHash('sha256') for proof generation
    critical: JSON.stringify with sorted keys for deterministic hashing
  ```

  ### Current Codebase tree (relevant files)

  ```txt
  apps/api/src/modules/transfer/transfer.service.ts  # advanceStatus
  apps/worker/src/morph-anchor.processor.ts           # From PRP 05 — worker skeleton
  packages/database/prisma/schema.prisma              # Transfer.morphTxHash field
  ```

  ### Desired Codebase tree

  ```txt
  apps/api/src/modules/morph/
  ├── morph.module.ts              # NestJS module
  ├── morph.service.ts             # Proof generation + anchoring
  └── morph.service.spec.ts        # Unit tests
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: Morph MUST NOT be in critical path — always async via BullMQ worker
  // CRITICAL: Proof hash must be deterministic — same input = same hash
  // CRITICAL: JSON.stringify can produce different output for same data — sort keys
  // CRITICAL: morphTxHash is optional until anchoring completes
  // CRITICAL: For hackathon demo, Morph SDK may need mock if testnet is unreliable
  ```

  ## Implementation Blueprint

  ### Data models and structure

  ```typescript
  // Proof payload — must be deterministic
  interface ProofPayload {
    transferId: string;
    amountPHP: string;      // String to avoid float issues
    amountIDR: string;      // String to avoid float issues
    rate: string;           // String to avoid float issues
    timestamp: number;      // Unix seconds
  }

  // Anchor result
  interface AnchorResult {
    proofHash: string;
    txHash: string;
    blockNumber?: number;
  }
  ```

  ### List of tasks

  ```yaml
  Task 6.1 — Morph Module:
    CREATE apps/api/src/modules/morph/morph.module.ts:
      - REGISTER as NestJS module
      - PROVIDE MorphService
      - IMPORT TransferModule (for advanceStatus)

  Task 6.2 — Morph Service:
    CREATE apps/api/src/modules/morph/morph.service.ts:
      - INJECT PrismaService, Morph SDK client
      - IMPLEMENT generateProof(transfer: Transfer): Promise<string>
        - BUILD payload: { transferId, amountPHP, amountIDR, rate, timestamp }
        - CONVERT Decimal fields to string for deterministic JSON
        - SORT keys in JSON.stringify for determinism
        - RETURN SHA-256 hex digest
      - IMPLEMENT anchorProof(transferId: string): Promise<string>
        - FETCH transfer from DB
        - CALL generateProof to get hash
        - SUBMIT proof to Morph chain via SDK
        - STORE morphTxHash on transfer record
        - RETURN txHash

  Task 6.3 — Wire into Worker:
    MODIFY apps/worker/src/morph-anchor.processor.ts:
      - ON job: CALL MorphService.anchorProof(transferId)
      - ON complete: CALL TransferService.advanceStatus(transferId, 'MORPH_ANCHORED')
      - HANDLE errors with retry logic

  Task 6.4 — Environment Config:
    MODIFY apps/api/.env:
      - ADD MORPH_RPC_URL=
      - ADD MORPH_PRIVATE_KEY= (for submitting tx)
      - ADD MORPH_CHAIN_ID=

  Task 6.5 — Unit Tests:
    CREATE apps/api/src/modules/morph/morph.service.spec.ts:
      - TEST generateProof is deterministic (same input = same hash)
      - TEST generateProof returns valid 64-char hex SHA-256
      - TEST anchorProof stores morphTxHash
  ```

  ### Per task pseudocode

  ```typescript
  // Task 6.2 — MorphService
  @Injectable()
  export class MorphService {
    constructor(
      private prisma: PrismaService,
      // private morphSdk: MorphSdk, // or ethers provider
    ) {}

    async generateProof(transfer: any): Promise<string> {
      const payload = JSON.stringify({
        transferId: transfer.id,
        amountPHP: transfer.sendAmount.toString(),  // Decimal → string
        amountIDR: transfer.receiveAmount.toString(),
        rate: transfer.exchangeRate.toString(),
        timestamp: Math.floor(new Date(transfer.createdAt).getTime() / 1000),
      });
      // PATTERN: SHA-256 for proof hash
      return createHash('sha256').update(payload).digest('hex');
    }

    async anchorProof(transferId: string): Promise<string> {
      const transfer = await this.prisma.transfer.findUnique({
        where: { id: transferId },
      });
      const proofHash = await this.generateProof(transfer);

      // CRITICAL: Submit to Morph chain — may be mock for hackathon
      const txHash = await this.submitToMorph(proofHash);

      await this.prisma.transfer.update({
        where: { id: transferId },
        data: { morphTxHash: txHash },
      });
      return txHash;
    }

    private async submitToMorph(proofHash: string): Promise<string> {
      // PATTERN: Use Morph SDK or ethers.js to submit proof
      // FOR HACKATHON: May mock this if testnet is unreliable
      // Return mock tx hash like '0x' + randomBytes(32).toString('hex')
      // Real implementation: submit via Morph SDK
    }
  }
  ```

  ### Integration Points

  ```yaml
  CONFIG:
    - add to: apps/api/.env
    - pattern: "MORPH_RPC_URL=, MORPH_PRIVATE_KEY=, MORPH_CHAIN_ID="

  BULLMQ:
    - queue: "morph-anchor — consumed by worker, calls MorphService.anchorProof"

  DATABASE:
    - update: "Transfer.morphTxHash — store after anchoring"

  STATUS:
    - advance: "MORPH_ANCHORED — final state after proof on-chain"
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
  describe('MorphService', () => {
    it('generates deterministic SHA-256 proof hash', async () => {
      const hash1 = await service.generateProof(mockTransfer);
      const hash2 = await service.generateProof(mockTransfer);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('produces different hashes for different transfers', async () => {
      const hash1 = await service.generateProof(mockTransfer1);
      const hash2 = await service.generateProof(mockTransfer2);
      expect(hash1).not.toBe(hash2);
    });

    it('anchorProof stores morphTxHash on transfer', async () => {
      const txHash = await service.anchorProof('transfer-id');
      // Verify prisma.update called with morphTxHash
    });
  });
  ```

  ```bash
  cd apps/api && pnpm test -- --verbose
  # Expected: All tests pass
  ```

  ## Final Validation Checklist

  - [ ] All tests pass: `cd apps/api && pnpm test -- --verbose`
  - [ ] No linting errors: `pnpm lint`
  - [ ] Proof hash is deterministic (same input = same output)
  - [ ] Morph anchoring runs async via BullMQ
  - [ ] Status advances to MORPH_ANCHORED after anchoring

  ---

  ## Anti-Patterns to Avoid

  - Do NOT await morph anchoring in settlement flow
  - Do NOT use float in proof payload — convert Decimal to string
  - Do NOT use non-deterministic JSON.stringify — sort keys or use explicit field order
  - Do NOT block settlement on Morph confirmation
  - Do NOT hardcode Morph RPC URL — use env var

  ## Dependencies

  - [PRP 04 — Settlement](./prp_04_settlement.md) (SettlementService queues morph-anchor)
  - [PRP 05 — Workers & Events](./prp_05_workers_events.md) (Worker processes morph-anchor jobs)

  ## Next PRP

  [PRP 07 — Landing Page](./prp_07_landing_page.md)
