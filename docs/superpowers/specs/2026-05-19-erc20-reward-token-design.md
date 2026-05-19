# ERC-20 Reward Token Design

**Date:** 2026-05-19
**Status:** Approved
**Scope:** Hackathon MVP — loyalty token system for ASEANFlow

## Overview

Add an ERC-20 reward token (AseanFlowToken / AFT) to ASEANFlow. Every completed transfer mints a fixed amount of AFT to the user's custodial wallet on Morph Hoodi testnet. Tokens are displayable, trackable, and usable for fee discounts on future transfers.

**Constraints:**
- No changes to transfer state machine (7 states remain)
- Settlement speed unchanged — minting is async, never blocks
- No auth — tracking code remains sole identifier
- Custodial wallets — system generates and manages keypairs

## 1. Smart Contract

**Token:** `AseanFlowToken` (symbol: `AFT`), standard ERC-20 on Morph Hoodi (chain 2910).

- Base: OpenZeppelin ERC-20
- Decimals: 18
- Owner-only `mint(address to, uint256 amount)`
- Fixed reward: 10 AFT per completed transfer
- Owner = deployer wallet (system's custodial private key)

No admin controls beyond mint in hackathon scope (no burn, pause, governance).

**Deployment:** Pre-deployed before app startup. Deploy script at `apps/worker/scripts/deploy-token.ts`. Contract address stored in env `REWARD_TOKEN_ADDRESS`.

## 2. Custodial Wallet System

**Wallet lifecycle:**

1. User creates first transfer → system generates ETH keypair via `ethers.Wallet.createRandom()`
2. Address stored in `Wallet` model, linked to transfers
3. Private key encrypted (AES-256-CBC) and stored in DB. Encryption key from env `WALLET_ENCRYPTION_KEY`
4. Same wallet reused for all future transfers — user provides previous tracking code, backend looks up associated wallet

**"Returning user" identity:** ASEANFlow has no user table or auth. A "returning user" is someone who provides a tracking code from a prior transfer. The backend resolves that tracking code to a wallet address and reuses it. First-time users get a new wallet automatically.

**Fee discount logic:**

1. User provides tracking code on send page (returning user)
2. Backend queries AFT balance via RPC `balanceOf(walletAddress)`
3. If balance >= threshold, apply percentage fee discount
4. Threshold and discount percent configurable via env

## 3. Reward Mint Worker

**New BullMQ queue:** `reward-mint`

**Flow:**

1. Settlement worker marks transfer `SETTLED` → queues `reward-mint` job
2. `reward-mint` processor:
   - Load transfer + wallet from DB
   - Call `token.mint(walletAddress, REWARD_AMOUNT)` via ethers contract instance
   - On success: update transfer with `rewardTxHash`, emit event
   - On failure: retry up to 3x with exponential backoff, then log `REWARD_FAILED`
3. Morph anchor runs independently (existing `morph-anchor` worker unchanged)

**Key design decision:** Reward mint is NOT a transfer state. It's a side-effect like Morph anchoring. The 7-state machine is untouched.

**Contract interaction:** Single ethers `Contract` instance connected to deployer wallet. Deployer holds owner/minter role.

**Error handling:** Failed mints don't affect settlement. Separate nullable `rewardTxHash` field on Transfer model.

## 4. API Changes

**New endpoints:**

- `GET /api/wallet/:trackingCode` — returns wallet address + AFT balance + formatted display
- `GET /api/wallet/:trackingCode/history` — returns reward mint events for that wallet

**Modified endpoints:**

- `POST /api/quote` — accepts optional `trackingCode`. If provided + balance >= threshold, returns reduced fee
- `POST /api/transfer` — accepts optional `trackingCode`. If returning user, reuse existing wallet; otherwise create new wallet
- `GET /api/transfer/:trackingCode` — response includes `rewardTxHash`, `walletAddress`, `rewardAmount`

## 5. Frontend Changes

- **Transfer detail page** (`/transfer/[id]`): show wallet address, AFT balance, reward status after settlement
- **Send page** (`/send`): if returning user enters tracking code, show "You have X AFT" badge and applied discount
- **New rewards page** (`/rewards/[trackingCode]`): token balance + transaction history list with mint tx hashes linked to Morph explorer
- **Landing page** (`/`): mention reward token in value prop section

## 6. Schema Changes

**New model:**

```prisma
model Wallet {
  id                  String   @id @default(cuid())
  address             String   @unique
  encryptedPrivateKey String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  transfers           Transfer[]
}
```

**Transfer model additions:**

```prisma
// Added to existing Transfer model
walletId     String?   // FK to Wallet
rewardTxHash String?   // Morph tx hash of mint transaction
rewardAmount Decimal?  @db.Decimal(36, 18) // AFT minted

wallet       Wallet?   @relation(fields: [walletId], references: [id])
```

## 7. Environment Variables

```env
REWARD_TOKEN_ADDRESS=0x...          # deployed contract address
REWARD_AMOUNT=10000000000000000000   # 10 AFT (18 decimals)
REWARD_FEE_DISCOUNT_THRESHOLD=100000000000000000000  # 100 AFT for discount
REWARD_FEE_DISCOUNT_PERCENT=50       # 50% fee reduction
WALLET_ENCRYPTION_KEY=<32-byte-hex>  # AES-256 key for private key encryption
DEPLOYER_PRIVATE_KEY=<hex>           # contract owner/minter key
```

Existing env vars unchanged. New vars have sensible defaults in code for development.

## 8. What Does NOT Change

- TransferStatus enum (7 states untouched)
- Settlement worker logic
- Morph anchor worker logic
- FX rate engine
- Ledger service
- No auth/login/KYC added
- Tracking code remains sole identifier

## 9. Architecture Diagram

```
User creates transfer
        │
        ▼
  [Transfer API] ──► Generate custodial wallet (if new user)
        │
        ▼
  [Settlement Worker]
   InstaPay → BI-FAST → SETTLED
        │
        ├──► [Morph Anchor Worker] (existing, unchanged)
        │         │
        │         ▼
        │    MORPH_ANCHORED
        │
        └──► [Reward Mint Worker] (NEW)
                  │
                  ▼
            mint AFT to user wallet
            store rewardTxHash
                  │
                  ▼
            User sees balance in UI
            Balance check → fee discount on next transfer
```
