name: "Base PRP Template v2 - Context-Rich with Validation Loops"
description: |

## Purpose

Template optimized for AI agents to implement features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles

1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules: Be sure to follow all rules in CLAUDE.md**

---

## Goal

Add ERC-20 reward token (AseanFlowToken / AFT) on Morph Hoodi testnet (chain 2910) to ASEANFlow. Every completed transfer mints 10 AFT to user's custodial wallet. Tokens are displayable, trackable, and usable for fee discounts on future transfers. No changes to the 7-state transfer machine — reward minting is an async side-effect.

## Why

- Loyalty incentive for hackathon judges — demonstrates blockchain utility beyond proof-of-anchoring
- Custodial wallet pattern shows DeFi capability without requiring user auth
- Fee discount creates economic loop encouraging repeat transfers
- Morph L2 smart contract interaction showcases full-stack blockchain integration

## What

### User-visible behavior

1. User completes transfer → receives AFT tokens in auto-generated custodial wallet
2. Transfer detail page shows wallet address + AFT balance after settlement
3. Returning user (provides prior tracking code) sees AFT balance + applied discount on send page
4. New `/rewards/[trackingCode]` page displays token balance + mint transaction history
5. Landing page mentions reward token in value proposition

### Success Criteria

- [ ] `Wallet` model in Prisma schema with encrypted private keys
- [ ] `reward-mint` BullMQ worker mints AFT after transfer reaches SETTLED
- [ ] `GET /api/wallet/:trackingCode` returns wallet address + AFT balance
- [ ] `GET /api/wallet/:trackingCode/history` returns mint events for wallet
- [ ] `POST /api/quote` accepts optional `trackingCode`, returns reduced fee if AFT balance eligible
- [ ] `POST /api/transfer` accepts optional `trackingCode`, reuses wallet for returning users
- [ ] `GET /api/transfer/:trackingCode` includes `rewardTxHash`, `walletAddress`, `rewardAmount`
- [ ] Transfer detail page shows wallet + AFT info after settlement
- [ ] Send page shows AFT badge + discount for returning users
- [ ] `/rewards/[trackingCode]` page with balance + mint history
- [ ] Transfer state machine unchanged (7 states, linear, no skip/reverse)
- [ ] All monetary fields use Prisma Decimal — never float

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://docs.ethers.org/v6/api/contract/
  why: ethers v6 Contract class — creating contract instances, calling write methods (mint, balanceOf)

- url: https://docs.ethers.org/v6/api/wallet/
  why: ethers v6 Wallet — createRandom() for keypair generation, connect() for provider binding

- url: https://docs.ethers.org/v6/api/providers/
  why: JsonRpcProvider — connecting to Morph Hoodi RPC endpoint

- url: https://docs.openzeppelin.com/contracts/5.x/erc20
  why: Standard ERC-20 interface — mint(address,uint256), balanceOf(address), decimals(), symbol()

- url: https://docs.openzeppelin.com/contracts/5.x/access-control
  why: Ownable pattern — onlyOwner modifier for mint access control

- url: https://docs.morphl2.io/
  why: Morph Hoodi testnet — RPC at https://rpc-hoodi.morph.network, chain ID 2910, explorer at https://explorer-hoodi.morph.network

- url: https://docs.bullmq.io/guide/retrying-failing-jobs
  why: BullMQ retry patterns — attempts config, exponential backoff strategy

- url: https://nodejs.org/api/crypto.html#class-cipher
  why: Node.js crypto.createCipheriv — AES-256-CBC for private key encryption

- file: apps/worker/src/morph-anchor.processor.ts
  why: EXISTING PATTERN for ethers init (provider, wallet, real vs mock mode). Mirror exactly for reward-mint processor.

- file: apps/worker/src/settlement.processor.ts
  why: EXISTING PATTERN for BullMQ job processing, state machine advancement, Prisma queries

- file: apps/worker/src/main.ts
  why: EXISTING PATTERN for BullMQ Worker setup, queue chaining on completed events

- file: apps/api/src/modules/transfer/transfer.service.ts
  why: EXISTING PATTERN for transfer creation, Prisma Decimal usage, tracking code generation

- file: apps/api/src/modules/transfer/transfer.controller.ts
  why: EXISTING PATTERN for NestJS controller with BullMQ Queue injection

- file: apps/api/src/modules/transfer/transfer.module.ts
  why: EXISTING PATTERN for NestJS module with BullMQ Queue factory provider

- file: apps/api/src/modules/fx/fx.service.ts
  why: EXISTING PATTERN for fee calculation in calculateQuote — MODIFY for discount logic

- file: apps/api/src/modules/settlement/settlement.module.ts
  why: EXISTING PATTERN for MORPH_QUEUE factory — replicate for REWARD_QUEUE

- file: apps/web/lib/api/hooks.ts
  why: EXISTING PATTERN for React Query hooks — useQuery, useMutation, polling

- file: apps/web/lib/api/transfer.ts
  why: EXISTING PATTERN for API client fetch functions

- file: packages/database/prisma/schema.prisma
  why: EXISTING SCHEMA — Transfer model, LedgerEntry model, Currency/TransferStatus enums

- file: packages/shared/src/types/transfer.ts
  why: EXISTING TYPES — QuoteResponse, TransferDetailResponse, TransferResponse, CreateQuoteSchema

- file: packages/shared/src/schemas/quote.schema.ts
  why: EXISTING SCHEMAS — barrel export for quote schemas

- file: packages/database/src/index.ts
  why: EXISTING PATTERN for createPrismaClient factory with adapter-pg

- docfile: docs/superpowers/specs/2026-05-19-erc20-reward-token-design.md
  why: Full feature spec — architecture diagram, schema, endpoints, frontend changes, env vars
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash
apps/
  api/src/
    app.module.ts                          # Root NestJS module
    common/
      services/prisma.service.ts           # PrismaClient with @prisma/adapter-pg
      modules/prisma.module.ts
    modules/
      transfer/
        transfer.controller.ts             # POST /quote, POST /transfer, GET /transfer/:code
        transfer.service.ts                # createTransfer, getByTrackingCode, advanceStatus
        transfer.module.ts                 # NestJS module + SETTLEMENT_QUEUE factory
        dto/
          create-transfer.dto.ts           # amount, from, to, quoteId?, idempotencyKey?
          create-quote.dto.ts              # amount, from, to
      fx/
        fx.service.ts                      # getRate, calculateQuote (fee=10 PHP fixed)
      settlement/
        settlement.module.ts               # MORPH_QUEUE factory
        settlement.service.ts
      morph/morph.module.ts
      health/health.module.ts
      ledger/ledger.module.ts
    events/transfer.events.ts
  worker/src/
    main.ts                                # BullMQ workers: settlement + morph-anchor
    settlement.processor.ts                # Linear state machine: CREATED→SETTLED
    morph-anchor.processor.ts              # SHA-256 proof → Morph chain (real or mock)
  web/
    app/
      page.tsx                             # Landing — hero, CTAs
      send/page.tsx                        # QuoteCalculator component
      transfer/[id]/page.tsx               # Transfer timeline with 1s polling
    lib/api/
      hooks.ts                             # useQuote, useCreateTransfer, useTransferStatus
      transfer.ts                          # createTransfer, getTransferByTrackingCode
      quote.ts                             # getQuote
    components/
      quote-calculator.tsx
      transfer-timeline.tsx
      morph-proof.tsx
packages/
  database/
    prisma/schema.prisma                   # Transfer + LedgerEntry models
    src/index.ts                           # createPrismaClient factory
  shared/src/
    schemas/quote.schema.ts               # CreateQuoteSchema, CreateTransferSchema
    types/transfer.ts                      # QuoteResponse, TransferDetailResponse
  redis/                                   # Redis wrapper with Cache class
  ui/                                      # shadcn/ui + Radix components
```

### Desired Codebase tree with files to be added and responsibility of file

```bash
# NEW FILES
apps/worker/scripts/deploy-token.ts             # Deploy AFT ERC-20 to Morph (manual, pre-deploy)
apps/worker/src/reward-mint.processor.ts        # Mint AFT to user wallet after SETTLED
apps/api/src/modules/wallet/wallet.module.ts    # NestJS module for wallet feature
apps/api/src/modules/wallet/wallet.controller.ts # GET /api/wallet/:code, GET /api/wallet/:code/history
apps/api/src/modules/wallet/wallet.service.ts   # Wallet CRUD, AES-256 encryption, balance check
apps/web/lib/api/wallet.ts                      # Fetch wallet info + history from API
apps/web/components/reward-badge.tsx            # AFT balance badge component
apps/web/components/wallet-info.tsx             # Wallet address + balance display
apps/web/components/mint-history.tsx            # List of mint transactions with explorer links
apps/web/app/rewards/[trackingCode]/page.tsx    # Rewards page — balance + mint history

# MODIFIED FILES
packages/database/prisma/schema.prisma          # ADD Wallet model + Transfer fields (walletId, rewardTxHash, rewardAmount)
packages/shared/src/schemas/quote.schema.ts     # ADD trackingCode optional field to both schemas
packages/shared/src/types/transfer.ts           # ADD discount, walletAddress, rewardTxHash, rewardAmount
apps/worker/src/main.ts                         # ADD reward-mint worker + queue chaining from settlement
apps/api/src/app.module.ts                      # IMPORT WalletModule
apps/api/src/modules/transfer/transfer.controller.ts  # PASS trackingCode to quote/transfer
apps/api/src/modules/transfer/transfer.service.ts     # ADD wallet creation/lookup on transfer
apps/api/src/modules/transfer/transfer.module.ts      # IMPORT WalletModule
apps/api/src/modules/transfer/dto/create-transfer.dto.ts  # ADD trackingCode field
apps/api/src/modules/transfer/dto/create-quote.dto.ts      # ADD trackingCode field
apps/api/src/modules/fx/fx.service.ts           # ADD fee discount logic based on AFT balance
apps/api/src/modules/settlement/settlement.module.ts  # ADD REWARD_QUEUE factory
apps/web/lib/api/hooks.ts                       # ADD useWallet, useWalletHistory hooks
apps/web/lib/api/transfer.ts                    # PASS trackingCode to createTransfer
apps/web/lib/api/quote.ts                       # PASS trackingCode to getQuote
apps/web/components/quote-calculator.tsx        # ADD tracking code input + AFT badge
apps/web/app/page.tsx                           # ADD AFT mention in value prop
apps/web/app/send/page.tsx                      # ADD returning user section
apps/web/app/transfer/[id]/page.tsx             # ADD wallet info + reward display
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Prisma v7 generator is "prisma-client" NOT "prisma-client-js"
// CRITICAL: Prisma v7 requires @prisma/adapter-pg — no auto .env loading
// CRITICAL: Import PrismaClient from "../generated/prisma/index.js" NOT "@prisma/client"
// CRITICAL: Prisma Decimal for ALL monetary fields — never number/float
//   Correct: new Prisma.Decimal("10000000000000000000")
//   Wrong:   10, 10.0, Number(amount)

// CRITICAL: ethers v6 — Wallet.createRandom() is static method on ethers.Wallet class
// CRITICAL: ethers v6 Contract for WRITE operations needs a signer, not just provider
//   Read:  new ethers.Contract(address, abi, provider)    // read-only
//   Write: new ethers.Contract(address, abi, wallet)      // wallet IS signer+provider

// CRITICAL: Node.js crypto AES-256-CBC
//   Key = exactly 32 bytes (64 hex chars)
//   IV  = exactly 16 bytes (32 hex chars)
//   Store format: "ivHex:ciphertextHex" — need both parts to decrypt

// CRITICAL: Morph Hoodi testnet may be flaky/unavailable
//   MUST implement real+mock pattern identical to morph-anchor.processor.ts
//   If DEPLOYER_PRIVATE_KEY or REWARD_TOKEN_ADDRESS missing → mock mode
//   Mock: generate fake txHash, skip blockchain calls

// CRITICAL: BullMQ job data must be plain serializable objects
//   No class instances, no Prisma Decimal objects in job.data
//   Pass transferId as string, not Decimal or complex objects

// CRITICAL: NestJS injects BullMQ Queue via string tokens
//   Existing: 'SETTLEMENT_QUEUE', 'MORPH_QUEUE'
//   New: 'REWARD_QUEUE' — same factory pattern in module providers

// CRITICAL: No auth system — tracking code is ONLY user identifier
//   "Returning user" = someone who provides a prior tracking code
//   Backend resolves trackingCode → Transfer → Wallet → reuse wallet address

// CRITICAL: Transfer state machine has 7 states, linear, no skip/reverse
//   NEVER add reward states. Reward mint is a SIDE-EFFECT, not a state transition.
//   Settlement worker reaches SETTLED → queues reward-mint job (same pattern as morph-anchor)

// CRITICAL: WALLET_ENCRYPTION_KEY generation
//   Generate: crypto.randomBytes(32).toString('hex')  → 64-char hex string
//   Must be set before app runs or wallet creation will fail

// CRITICAL: ERC-20 token amounts are uint256 with 18 decimals
//   10 AFT = "10000000000000000000" (as string, not number)
//   Use ethers.parseEther("10") to convert, ethers.formatEther() to display
```

## Implementation Blueprint

### Data models and structure

```prisma
// ADD to packages/database/prisma/schema.prisma

model Wallet {
  id                  String     @id @default(cuid())
  address             String     @unique
  encryptedPrivateKey String     // Format: "ivHex:ciphertextHex"
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt
  transfers           Transfer[]

  @@index([address])
  @@map("wallets")
}

// ADD to existing Transfer model (after bifastRef field, before timestamps):
walletId      String?
rewardTxHash  String?
rewardAmount  Decimal?  @db.Decimal(36, 18)

wallet        Wallet?   @relation(fields: [walletId], references: [id])
```

```typescript
// EXTEND in packages/shared/src/types/transfer.ts

// Add to CreateQuoteSchema:
trackingCode: z.string().optional()

// Add to CreateTransferSchema:
trackingCode: z.string().optional()

// Add to QuoteResponse interface:
discount?: { applied: boolean; percent: number; reason: string }

// Add to TransferDetailResponse interface:
walletAddress: string | null
rewardTxHash: string | null
rewardAmount: string | null
```

```solidity
// Smart contract — deploy separately before app startup
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AseanFlowToken is ERC20, Ownable {
    constructor() ERC20("AseanFlowToken", "AFT") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

```typescript
// Minimal ERC-20 ABI for ethers Contract interaction
const ERC20_ABI = [
  'function mint(address to, uint256 amount)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];
```

### list of tasks to be completed to fullfill the PRP in the order they should be completed

```yaml
Task 1:
  MODIFY packages/database/prisma/schema.prisma:
    - ADD Wallet model after LedgerEntry model (id, address @unique, encryptedPrivateKey, timestamps, transfers relation)
    - ADD walletId String? field to Transfer model
    - ADD rewardTxHash String? field to Transfer model
    - ADD rewardAmount Decimal? @db.Decimal(36, 18) field to Transfer model
    - ADD wallet Wallet? @relation(fields: [walletId], references: [id]) to Transfer model
    - RUN: cd packages/database && pnpm push

Task 2:
  MODIFY packages/shared/src/types/transfer.ts:
    - ADD trackingCode: z.string().optional() to CreateQuoteSchema
    - ADD trackingCode: z.string().optional() to CreateTransferSchema
    - ADD discount field to QuoteResponse interface
    - ADD walletAddress, rewardTxHash, rewardAmount to TransferDetailResponse interface

Task 3:
  CREATE apps/api/src/modules/wallet/wallet.service.ts:
    - MIRROR pattern from: apps/api/src/modules/transfer/transfer.service.ts (NestJS Injectable, PrismaService, ConfigService)
    - Methods: createWallet(), findByTrackingCode(), getBalance(), encryptPrivateKey(), decryptPrivateKey()
    - Mock mode: if REWARD_TOKEN_ADDRESS not set, getBalance returns "0"
  CREATE apps/api/src/modules/wallet/wallet.module.ts:
    - MIRROR pattern from: apps/api/src/modules/transfer/transfer.module.ts
  CREATE apps/api/src/modules/wallet/wallet.controller.ts:
    - MIRROR pattern from: apps/api/src/modules/transfer/transfer.controller.ts
    - GET /api/wallet/:trackingCode → address + balance + symbol
    - GET /api/wallet/:trackingCode/history → mint events array

Task 4:
  MODIFY apps/api/src/app.module.ts:
    - IMPORT WalletModule, ADD to imports array

Task 5:
  MODIFY apps/api/src/modules/transfer/dto/create-transfer.dto.ts:
    - ADD @IsOptional() @IsString() trackingCode?: string
  MODIFY apps/api/src/modules/transfer/dto/create-quote.dto.ts:
    - ADD @IsOptional() @IsString() trackingCode?: string

Task 6:
  MODIFY apps/api/src/modules/transfer/transfer.service.ts:
    - INJECT WalletService
    - MODIFY createTransfer(): accept trackingCode, lookup/create wallet, set walletId on transfer
    - MODIFY getByTrackingCode(): include wallet relation, return walletAddress/rewardTxHash/rewardAmount
  MODIFY apps/api/src/modules/transfer/transfer.module.ts:
    - IMPORT WalletModule

Task 7:
  MODIFY apps/api/src/modules/fx/fx.service.ts:
    - INJECT WalletService
    - MODIFY calculateQuote(): accept trackingCode param, check AFT balance, apply fee discount if eligible
    - Return discount object in response

Task 8:
  MODIFY apps/api/src/modules/transfer/transfer.controller.ts:
    - PASS dto.trackingCode to calculateQuote and createTransfer calls

Task 9:
  CREATE apps/worker/src/reward-mint.processor.ts:
    - MIRROR pattern from: apps/worker/src/morph-anchor.processor.ts (ethers init, real vs mock)
    - Init: load REWARD_TOKEN_ADDRESS, DEPLOYER_PRIVATE_KEY, create ethers Contract with signer
    - Process: load transfer+wallet, call token.mint(), update rewardTxHash/rewardAmount on transfer
    - Mock mode: fake txHash when env vars missing
  MODIFY apps/worker/src/main.ts:
    - IMPORT processRewardMint
    - ADD reward-mint Worker (concurrency 3)
    - ADD queue chaining: settlement completed → queue reward-mint job (same as morph-anchor pattern)
    - ADD completed/failed event handlers
    - ADD rewardMintWorker.close() to SIGTERM/SIGINT handlers

Task 10:
  MODIFY apps/api/src/modules/settlement/settlement.module.ts:
    - ADD REWARD_QUEUE factory provider (same pattern as MORPH_QUEUE)

Task 11:
  CREATE apps/web/lib/api/wallet.ts:
    - MIRROR pattern from: apps/web/lib/api/transfer.ts
    - getWalletInfo(trackingCode) → GET /api/wallet/:code
    - getWalletHistory(trackingCode) → GET /api/wallet/:code/history
  MODIFY apps/web/lib/api/quote.ts:
    - MODIFY getQuote() to accept optional trackingCode, pass in body
  MODIFY apps/web/lib/api/transfer.ts:
    - MODIFY createTransfer() to accept optional trackingCode, pass in body

Task 12:
  MODIFY apps/web/lib/api/hooks.ts:
    - ADD useWallet(trackingCode) hook — query wallet info
    - ADD useWalletHistory(trackingCode) hook — query mint history
    - MODIFY useQuote to accept+pass trackingCode
    - MODIFY useCreateTransfer to accept+pass trackingCode

Task 13:
  CREATE apps/web/components/reward-badge.tsx:
    - AFT balance badge using shadcn Badge component
  CREATE apps/web/components/wallet-info.tsx:
    - Wallet address (truncated) + balance display with copy-to-clipboard
  CREATE apps/web/components/mint-history.tsx:
    - Mint transaction list with Morph explorer links
  MODIFY apps/web/components/quote-calculator.tsx:
    - ADD tracking code input for returning users
    - Show AFT balance + discount when trackingCode resolves

Task 14:
  MODIFY apps/web/app/page.tsx:
    - ADD AFT mention in value prop section
  MODIFY apps/web/app/send/page.tsx:
    - ADD returning user section with tracking code input
  MODIFY apps/web/app/transfer/[id]/page.tsx:
    - ADD wallet info section after SETTLED status
    - ADD reward tx hash link to Morph explorer
  CREATE apps/web/app/rewards/[trackingCode]/page.tsx:
    - Token balance + mint history page using WalletInfo, MintHistory, RewardBadge components

Task 15:
  CREATE apps/worker/scripts/deploy-token.ts:
    - Hardhat/ethers deploy script for AFT contract
    - Print deployed address for env config
    - Run manually before app startup, not part of build
```

### Per task pseudocode as needed added to each task

```typescript
// Task 3 — WalletService pseudocode
@Injectable()
export class WalletService {
  private provider: ethers.JsonRpcProvider | null = null;
  private tokenContract: ethers.Contract | null = null;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    // PATTERN: mirror morph-anchor.processor.ts init
    const tokenAddr = config.get('REWARD_TOKEN_ADDRESS');
    if (tokenAddr) {
      this.provider = new ethers.JsonRpcProvider(config.get('MORPH_RPC_URL', 'https://rpc-hoodi.morph.network'), 2910);
      this.tokenContract = new ethers.Contract(tokenAddr, ERC20_ABI, this.provider);
    }
  }

  async createWallet() {
    // GOTCHA: ethers.Wallet.createRandom() — v6 static method
    const rawWallet = ethers.Wallet.createRandom();
    const encrypted = this.encryptPrivateKey(rawWallet.privateKey);
    // PATTERN: Prisma create, return address + id
    return this.prisma.wallet.create({ data: { address: rawWallet.address, encryptedPrivateKey: encrypted } });
  }

  async findByTrackingCode(code: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { trackingCode: code }, include: { wallet: true },
    });
    return transfer?.wallet ?? null;
  }

  async getBalance(address: string): Promise<string> {
    // GOTCHA: no tokenContract → mock mode, return "0"
    if (!this.tokenContract) return '0';
    const bal = await this.tokenContract.balanceOf(address);
    return ethers.formatEther(bal);
  }

  // PATTERN: Node.js crypto AES-256-CBC
  private encryptPrivateKey(pk: string): string {
    // GOTCHA: key must be 32 bytes, IV must be 16 bytes
    const key = Buffer.from(this.config.get('WALLET_ENCRYPTION_KEY'), 'hex');
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const enc = Buffer.concat([cipher.update(pk, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${enc.toString('hex')}`;  // store iv+ciphertext together
  }
}

// Task 3 — WalletController pseudocode
@Controller('api/wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get(':trackingCode')
  async getWallet(@Param('trackingCode') code: string) {
    // 1. findByTrackingCode → get wallet
    // 2. getBalance → get AFT balance
    // 3. return { address, balance, symbol: "AFT" }
    // 4. 404 if no wallet found
  }

  @Get(':trackingCode/history')
  async getHistory(@Param('trackingCode') code: string) {
    // 1. find transfer by trackingCode → get walletId
    // 2. find ALL transfers with same walletId WHERE rewardTxHash IS NOT NULL
    // 3. return { rewards: [{ transferCode, amount, txHash, createdAt }] }
  }
}

// Task 6 — TransferService.createTransfer modification pseudocode
async createTransfer(dto: CreateTransferDto) {
  // EXISTING: idempotency check, quote calculation, tracking code generation
  let walletId: string | null = null;

  if (dto.trackingCode) {
    // Returning user — find existing wallet
    const existingWallet = await this.walletService.findByTrackingCode(dto.trackingCode);
    if (existingWallet) walletId = existingWallet.id;
  }

  if (!walletId) {
    // New user — create custodial wallet
    const wallet = await this.walletService.createWallet();
    walletId = wallet.id;
  }

  const transfer = await this.prisma.transfer.create({
    data: {
      // ...existing fields...
      walletId,  // NEW: link to wallet
    },
  });
  // ...rest of existing logic
}

// Task 7 — FxService.calculateQuote modification pseudocode
async calculateQuote(amount: number, from: string, to: string, trackingCode?: string) {
  const rate = await this.getRate(from, to);
  let fee = 10;  // base fee
  let discount = { applied: false, percent: 0, reason: '' };

  if (trackingCode) {
    const wallet = await this.walletService.findByTrackingCode(trackingCode);
    if (wallet) {
      const balance = await this.walletService.getBalance(wallet.address);
      // GOTCHA: compare as float for threshold check (display only, not stored)
      const threshold = parseFloat(this.config.get('REWARD_FEE_DISCOUNT_THRESHOLD', '100'));
      if (parseFloat(balance) >= threshold) {
        const discountPercent = this.config.get<number>('REWARD_FEE_DISCOUNT_PERCENT', 50);
        fee = fee * (1 - discountPercent / 100);
        discount = { applied: true, percent: discountPercent, reason: 'AFT holder discount' };
      }
    }
  }

  const receiveAmount = (amount - fee) * rate;
  return { rate, fee, receiveAmount, timestamp: Date.now(), discount };
}

// Task 9 — reward-mint.processor.ts pseudocode
const prisma = createPrismaClient();
let tokenContract: ethers.Contract | null = null;

function initToken() {
  // PATTERN: identical to morph-anchor.processor.ts initMorph()
  const addr = process.env.REWARD_TOKEN_ADDRESS;
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!addr || !key) { console.warn('[reward-mint] mock mode'); return; }
  const provider = new ethers.JsonRpcProvider(process.env.MORPH_RPC_URL || 'https://rpc-hoodi.morph.network', 2910);
  const signer = new ethers.Wallet(key, provider);
  tokenContract = new ethers.Contract(addr, ERC20_ABI, signer);
}
initToken();

export async function processRewardMint(job: Job<{ transferId: string }>) {
  const transfer = await prisma.transfer.findUnique({
    where: { id: job.data.transferId }, include: { wallet: true },
  });
  if (!transfer?.wallet) return { transferId: job.data.transferId, status: 'SKIPPED' };
  if (transfer.rewardTxHash) return { transferId: job.data.transferId, status: 'ALREADY_MINTED' };

  let txHash: string;
  if (tokenContract) {
    // Real mint — GOTCHA: need signer-connected contract, not provider-only
    const tx = await tokenContract.mint(transfer.wallet.address, process.env.REWARD_AMOUNT || '10000000000000000000');
    const receipt = await tx.wait(1);
    if (!receipt) throw new Error(`Mint tx ${tx.hash} failed`);
    txHash = tx.hash;
  } else {
    // Mock — PATTERN: same as morph-anchor.processor.ts submitMock
    await new Promise(r => setTimeout(r, 1500));
    txHash = '0x' + createHash('sha256').update(job.data.transferId + Date.now()).digest('hex');
  }

  // GOTCHA: Prisma Decimal for rewardAmount, string constructor
  await prisma.transfer.update({
    where: { id: job.data.transferId },
    data: { rewardTxHash: txHash, rewardAmount: new Prisma.Decimal(process.env.REWARD_AMOUNT || '10000000000000000000') },
  });
  return { transferId: job.data.transferId, status: 'REWARDED', txHash };
}

// Task 9 — main.ts modification pseudocode
// ADD alongside existing workers:
const rewardMintWorker = new Worker("reward-mint", processRewardMint, { connection, concurrency: 3 });

// In settlementWorker.on('completed') callback, ADD:
const rewardQueue = new Queue("reward-mint", { connection });
rewardQueue.add("mint", { transferId: job.returnvalue.transferId })
  .then(() => rewardQueue.close())
  .catch(err => console.error("[settlement] failed to queue reward-mint:", err));

// ADD event handlers for rewardMintWorker (completed, failed)
// ADD rewardMintWorker.close() to SIGTERM/SIGINT handlers
```

### Integration Points

```yaml
DATABASE:
  - migration: "Add Wallet model with encryptedPrivateKey, add walletId/rewardTxHash/rewardAmount to Transfer"
  - index: "CREATE INDEX on wallets.address, existing index on transfers.trackingCode"

CONFIG:
  - add to: .env
  - vars:
    - REWARD_TOKEN_ADDRESS=0x...  # deployed AFT contract on Morph Hoodi
    - REWARD_AMOUNT=10000000000000000000  # 10 AFT (18 decimals)
    - REWARD_FEE_DISCOUNT_THRESHOLD=100000000000000000000  # 100 AFT
    - REWARD_FEE_DISCOUNT_PERCENT=50  # 50% fee reduction
    - WALLET_ENCRYPTION_KEY=<64-char hex>  # AES-256 key
    - DEPLOYER_PRIVATE_KEY=<hex>  # contract owner/minter

ROUTES:
  - add to: apps/api/src/app.module.ts
  - pattern: "imports: [...existing, WalletModule]"
  - new endpoints:
    - GET /api/wallet/:trackingCode
    - GET /api/wallet/:trackingCode/history

QUEUE:
  - add to: apps/worker/src/main.ts
  - pattern: "new Worker('reward-mint', processRewardMint, { connection, concurrency: 3 })"
  - chaining: "settlement completed → queue reward-mint job"
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Schema first
cd packages/database && pnpm push

# Regenerate Prisma client
pnpm generate

# TypeScript check — all workspaces
pnpm type-check

# Lint all
pnpm lint

# Expected: No errors. If errors, READ the error message, fix, re-run.
```

### Level 2: API Endpoint Tests

```bash
# Start infrastructure
docker compose -f docker-compose.dev.yml up -d
pnpm dev

# Test 1: Create transfer (new user — auto wallet)
curl -s -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "from": "PHP", "to": "IDR"}' | jq .
# Expected: { "trackingCode": "TXN...", "status": "CREATED" }

# Test 2: Get transfer (check wallet fields)
# Use tracking code from Test 1
curl -s http://localhost:3001/api/transfer/TXN... | jq .
# Expected: includes walletAddress (non-null), rewardTxHash (null initially), rewardAmount (null)

# Test 3: Get wallet info (after reward mint completes — wait ~10s for settlement)
curl -s http://localhost:3001/api/wallet/TXN... | jq .
# Expected: { "address": "0x...", "balance": "10", "symbol": "AFT" }
# In mock mode: balance might be "0" (no real contract)

# Test 4: Quote with discount check
curl -s -X POST http://localhost:3001/api/quote \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "from": "PHP", "to": "IDR", "trackingCode": "TXN..."}' | jq .
# Expected: includes discount object { applied: true/false, percent: 0-50 }

# Test 5: Returning user transfer (same wallet)
curl -s -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"amount": 2000, "from": "PHP", "to": "IDR", "trackingCode": "TXN..."}' | jq .
# Expected: new tracking code, same walletAddress as Test 1

# Test 6: Wallet history
curl -s http://localhost:3001/api/wallet/TXN.../history | jq .
# Expected: { "rewards": [...] } array of mint events

# Test 7: Health check still works
curl -s http://localhost:3001/api/health | jq .
# Expected: { "status": "ok", "services": { "postgres": "ok", "redis": "ok" } }
```

### Level 3: Worker Integration

```bash
# Watch worker console output
# After creating a transfer, should see:
# [settlement] completed: <jobId> -> {"transferId":"...","status":"SETTLED"}
# [reward-mint] Minting 10 AFT to 0x...
# [reward-mint] Confirmed: 0x...  (or [reward-mint] Mock mint: 0x... in mock mode)

# Verify transfer updated in DB
docker exec aseanflow-dev-postgres psql -U postgres -d aseanflow_dev \
  -c "SELECT tracking_code, reward_tx_hash, reward_amount FROM transfers WHERE reward_tx_hash IS NOT NULL;"
# Expected: rows with reward_tx_hash and reward_amount populated

# Verify wallet created
docker exec aseanflow-dev-postgres psql -U postgres -d aseanflow_dev \
  -c "SELECT id, address FROM wallets;"
# Expected: at least 1 row with ethereum address
```

### Level 4: Frontend

```bash
# Start frontend
pnpm dev --filter web

# Manual browser tests:
# 1. Visit http://localhost:3000 → see AFT mention in landing page
# 2. Click "Send Money" → enter amount → no tracking code → submit → redirect to transfer page
# 3. On transfer page → wait for settlement → see wallet address + AFT balance appear
# 4. Go back to /send → enter prior tracking code → see AFT badge + discount info
# 5. Visit /rewards/<trackingCode> → see balance + mint history list
# 6. Verify Morph explorer links work on mint history items
```

## Final validation Checklist

- [ ] All types pass: `pnpm type-check`
- [ ] No lint errors: `pnpm lint`
- [ ] Schema migrated: `cd packages/database && pnpm push` succeeds
- [ ] All API endpoints return correct JSON (Tests 1-7 above)
- [ ] Worker processes reward-mint jobs (check logs)
- [ ] Transfer with tracking code reuses existing wallet
- [ ] Fee discount applied when AFT balance >= threshold
- [ ] Transfer state machine unchanged — 7 states, linear, no skip/reverse
- [ ] All monetary values use Prisma Decimal — no float
- [ ] Private keys encrypted with AES-256-CBC — never stored plaintext
- [ ] Mock mode works without blockchain env vars (REWARD_TOKEN_ADDRESS, DEPLOYER_PRIVATE_KEY)
- [ ] Frontend /transfer page shows wallet + AFT after settlement
- [ ] Frontend /send shows AFT badge for returning users
- [ ] Frontend /rewards page displays balance + history
- [ ] No auth added — tracking code remains sole identifier

---

## Anti-Patterns to Avoid

- Don't add reward mint as a TransferStatus state — it's a side-effect, not a state
- Don't block settlement on reward minting — async BullMQ queue, fire-and-forget
- Don't store unencrypted private keys — AES-256-CBC always
- Don't use float for money — Prisma Decimal everywhere (string constructor)
- Don't modify the 7-state machine — only add nullable fields to Transfer model
- Don't add auth/login — tracking code remains sole identifier
- Don't create new patterns — mirror existing worker/service/controller patterns exactly
- Don't skip mock mode — app MUST run without blockchain env vars
- Don't over-engineer — hackathon MVP, simplest working solution
- Don't wait for Morph confirmations in critical path — reward mint is async
