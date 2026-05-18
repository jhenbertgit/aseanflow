name: "PRP 06 — Morph Integration: Proof Generation + Async Anchoring"
description: |

  ## Purpose

  Integrate Morph blockchain for immutable settlement proofs. Generate SHA-256 proof hashes, anchor on Morph Hoodi testnet async via BullMQ worker. Morph NEVER in critical settlement path.

  ## Core Principles

  1. **Context is King**: Include ALL docs, examples, caveats
  2. **Validation Loops**: Provide executable tests/lints AI can run + fix
  3. **Information Dense**: Use codebase keywords + patterns
  4. **Progressive Success**: Start simple, validate, enhance
  5. **Global rules**: Follow all rules in `CLAUDE.md`

  ---

  ## Goal

  Build MorphService: deterministic SHA-256 proof hashes from transfer data, submit to Morph Hoodi testnet. Anchoring runs in BullMQ worker post-settlement. Store `morphTxHash` on transfer record. Advance status to `MORPH_ANCHORED`.

  ## Why

  - **Morph integration requirement**: Hackathon requires meaningful Morph usage
  - **Immutable proofs**: On-chain verifiable without speed compromise
  - **Async by design**: Anchoring never blocks settlement — speed + trust

  ## What

  ### User-visible behavior
  - After SETTLED, transfer eventually shows MORPH_ANCHORED
  - Proof hash + txHash displayed in UI
  - txHash links to Morph Hoodi block explorer

  ### Technical requirements
  - MorphService: `generateProof()` + `anchorProof()`
  - SHA-256 hash of deterministic JSON payload
  - Submit proof to Morph Hoodi testnet via ethers.js v6
  - Dual mode: real testnet (when MORPH_PRIVATE_KEY set) / mock (fallback)
  - Store `morphTxHash` on transfer record
  - Advance status to MORPH_ANCHORED on completion
  - All async via BullMQ worker

  ### Success Criteria

  - [x] `generateProof` produces deterministic SHA-256 hash
  - [x] Same transfer data → same hash
  - [x] `anchorProof` submits to Morph chain (real testnet or mock)
  - [x] `morphTxHash` stored on transfer record
  - [x] Status advances to MORPH_ANCHORED after anchoring
  - [x] Morph anchoring does NOT block settlement
  - [x] Unit tests pass for proof generation

  ## All Needed Context

  ### Documentation & References

  ```yaml
  - url: https://morph.network/
    why: Morph L2 blockchain

  - url: https://docs.morph.network/docs/build-on-morph/sdk/js-sdk
    why: Morph SDK (ethers5 variant) for chain interaction
    critical: We use ethers v6 directly — no @morph-l2/sdk dependency needed

  - url: https://explorer-hoodi.morph.network
    why: Block explorer for verifying anchored proofs

  - url: https://morph-rails-hoodi.morph.network/faucet
    why: Get testnet ETH for funding wallet

  - doc: Node.js crypto
    section: createHash('sha256') for proof generation
    critical: JSON.stringify with explicit field order for deterministic hashing
  ```

  ### Morph Hoodi Testnet Config

  ```yaml
  Network: Morph Hoodi Testnet
  RPC: https://rpc-hoodi.morph.network
  Chain ID: 2910
  Explorer: https://explorer-hoodi.morph.network
  Faucet: https://morph-rails-hoodi.morph.network/faucet
  Bridge: https://bridge-hoodi.morph.network

  L1 (Ethereum Hoodi): chain 560048
  L2 Predeploys:
    L2CrossDomainMessenger: "0x5300000000000000000000000000000000000007"
    L2ToL1MessagePasser: "0x5300000000000000000000000000000000000001"
  ```

  ### Current Codebase tree (implemented)

  ```txt
  apps/api/src/modules/morph/
  ├── morph.module.ts              # NestJS module ✅
  ├── morph.service.ts             # Proof generation + real/mock anchoring ✅
  └── morph.service.spec.ts        # Unit tests (6 passing) ✅
  apps/worker/src/morph-anchor.processor.ts  # Worker with real/mock submission ✅
  apps/api/src/app.module.ts                  # MorphModule registered ✅
  apps/api/.env                               # Morph config present ✅
  ```

  ### Known Gotchas & Library Quirks

  ```typescript
  // CRITICAL: Morph MUST NOT be in critical path — always async via BullMQ worker
  // CRITICAL: Proof hash must be deterministic — same input = same hash
  // CRITICAL: JSON.stringify with explicit field order (not sorted keys) for determinism
  // CRITICAL: morphTxHash is optional until anchoring completes
  // CRITICAL: ethers v6 JsonRpcProvider needs number chainId, not string
  // CRITICAL: No MORPH_PRIVATE_KEY = mock mode (safe fallback for tests/demo)
  // CRITICAL: Real submission sends zero-value tx to self with proof hash as calldata
  ```

  ## Implementation Blueprint

  ### Data models and structure

  ```typescript
  // Anchor result
  interface AnchorResult {
    proofHash: string;
    txHash: string;
    blockNumber?: number;
  }
  ```

  ### Completed tasks

  ```yaml
  Task 6.1 — Morph Module: ✅
    apps/api/src/modules/morph/morph.module.ts:
      - REGISTER as NestJS module
      - PROVIDE + EXPORT MorphService

  Task 6.2 — Morph Service: ✅
    apps/api/src/modules/morph/morph.service.ts:
      - INJECT PrismaService, ConfigService
      - INIT ethers v6 provider + wallet from env config
      - IMPLEMENT generateProof(transfer): string (sync, deterministic SHA-256)
      - IMPLEMENT anchorProof(transferId): Promise<AnchorResult>
      - IMPLEMENT submitReal(proofHash): sends tx to Morph Hoodi, waits 1 confirmation
      - IMPLEMENT submitMock(proofHash): generates deterministic mock txHash
      - GRACEFUL fallback: no private key → mock mode

  Task 6.3 — Wire into Worker: ✅
    apps/worker/src/morph-anchor.processor.ts:
      - INIT ethers provider + wallet at module load
      - GENERATE deterministic proof hash
      - SUBMIT real/mock based on MORPH_PRIVATE_KEY presence
      - STORE morphTxHash + advance status to MORPH_ANCHORED

  Task 6.4 — Environment Config: ✅
    apps/api/.env + apps/api/.env.example:
      - MORPH_ENABLED=true
      - MORPH_RPC_URL=https://rpc-hoodi.morph.network
      - MORPH_CHAIN_ID=2910
      - MORPH_PRIVATE_KEY= (set for real testnet, empty for mock)

  Task 6.5 — Unit Tests: ✅
    apps/api/src/modules/morph/morph.service.spec.ts:
      - TEST generateProof is deterministic (same input = same hash)
      - TEST generateProof returns valid 64-char hex SHA-256
      - TEST different transfers produce different hashes
      - TEST anchorProof stores morphTxHash
      - TEST anchorProof throws if transfer not found
      - TEST anchorProof throws if transfer not SETTLED

  Task 6.6 — Register Module: ✅
    apps/api/src/app.module.ts:
      - IMPORT MorphModule
  ```

  ### Implementation details

  ```typescript
  // Proof generation — deterministic, sync
  generateProof(transfer: Transfer): string {
    const payload = JSON.stringify({
      transferId: transfer.id,
      amountPHP: transfer.sendAmount.toString(),    // Decimal → string
      amountIDR: transfer.receiveAmount.toString(),
      rate: transfer.exchangeRate.toString(),
      timestamp: Math.floor(new Date(transfer.createdAt).getTime() / 1000),
    });
    return createHash('sha256').update(payload).digest('hex');
  }

  // Real submission — ethers v6 to Morph Hoodi
  private async submitReal(proofHash: string): Promise<AnchorResult> {
    if (!this.wallet) throw new Error('Wallet not initialized');
    const tx = await this.wallet.sendTransaction({
      to: this.wallet.address,
      data: '0x' + proofHash,
      value: 0n,
    });
    const receipt = await tx.wait(1);
    return { proofHash, txHash: tx.hash, blockNumber: Number(receipt.blockNumber) };
  }

  // Mock fallback — no private key needed
  private async submitMock(proofHash: string): Promise<AnchorResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const txHash = '0x' + createHash('sha256').update(proofHash + Date.now()).digest('hex');
    return { proofHash, txHash, blockNumber: Math.floor(Date.now() / 1000) };
  }
  ```

  ### Integration Points

  ```yaml
  CONFIG:
    - apps/api/.env: MORPH_RPC_URL, MORPH_CHAIN_ID, MORPH_PRIVATE_KEY
    - defaults: Morph Hoodi testnet (chain 2910)

  BULLMQ:
    - queue: morph-anchor — consumed by worker

  DATABASE:
    - Transfer.morphTxHash: stored after anchoring

  STATUS:
    - MORPH_ANCHORED: final state after proof on-chain

  EXPLORER:
    - https://explorer-hoodi.morph.network/tx/{txHash}
  ```

  ## Validation Loop

  ### Level 1: Syntax & Style

  ```bash
  pnpm lint
  pnpm format
  # Expected: 0 errors (pre-existing warnings OK)
  ```

  ### Level 2: Unit Tests

  ```bash
  cd apps/api && npx jest --testPathPattern=morph --verbose
  # Expected: 6 tests pass
  ```

  ### Level 3: Real Testnet (manual)

  ```bash
  # 1. Fund wallet at https://morph-rails-hoodi.morph.network/faucet
  # 2. Set MORPH_PRIVATE_KEY in apps/api/.env
  # 3. Start dev: pnpm dev
  # 4. Create transfer, wait for MORPH_ANCHORED
  # 5. Verify on https://explorer-hoodi.morph.network
  ```

  ## Final Validation Checklist

  - [x] All tests pass: `cd apps/api && npx jest --testPathPattern=morph --verbose`
  - [x] No linting errors: `pnpm lint`
  - [x] Proof hash deterministic (same input = same output)
  - [x] Morph anchoring async via BullMQ
  - [x] Status advances to MORPH_ANCHORED after anchoring
  - [x] Real testnet submission when MORPH_PRIVATE_KEY set
  - [x] Mock fallback when no private key

  ---

  ## Anti-Patterns to Avoid

  - Do NOT await morph anchoring in settlement flow
  - Do NOT use float in proof payload — convert Decimal to string
  - Do NOT use non-deterministic `JSON.stringify` — explicit field order
  - Do NOT block settlement on Morph confirmation
  - Do NOT hardcode Morph RPC URL — use env var
  - Do NOT require Morph SDK (`@morph-l2/sdk`) — ethers v6 sufficient for tx submission

  ## Dependencies

  - `ethers@^6` (added to apps/api + apps/worker)
  - [PRP 04 — Settlement](./prp_04_settlement.md) (SettlementService queues morph-anchor)
  - [PRP 05 — Workers & Events](./prp_05_workers_events.md) (Worker processes morph-anchor jobs)

  ## Next PRP

  [PRP 07 — Landing Page](./prp_07_landing_page.md)