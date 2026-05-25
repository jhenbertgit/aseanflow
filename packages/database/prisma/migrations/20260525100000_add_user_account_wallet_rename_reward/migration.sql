-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cookieToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "balance" DECIMAL(18, 2) NOT NULL DEFAULT '0.00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cookieToken_key" ON "users"("cookieToken");

-- CreateIndex
CREATE UNIQUE INDEX "account_wallets_userId_currency_key" ON "account_wallets"("userId", "currency");

-- CreateIndex
CREATE INDEX "account_wallets_userId_idx" ON "account_wallets"("userId");

-- AddForeignKey
ALTER TABLE "account_wallets" ADD CONSTRAINT "account_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop existing FK from transfers to wallets
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_walletId_fkey";

-- Rename wallets table to reward_wallets
ALTER TABLE "wallets" RENAME TO "reward_wallets";

-- Rename primary key index
ALTER INDEX "wallets_pkey" RENAME TO "reward_wallets_pkey";

-- Rename unique constraint index
ALTER INDEX "wallets_address_key" RENAME TO "reward_wallets_address_key";

-- Rename address index
ALTER INDEX "wallets_address_idx" RENAME TO "reward_wallets_address_idx";

-- Recreate FK from transfers to reward_wallets
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "reward_wallets"("id") ON UPDATE CASCADE ON DELETE SET NULL;

-- Add senderId column to transfers
ALTER TABLE "transfers" ADD COLUMN "senderId" TEXT;

-- CreateIndex
CREATE INDEX "transfers_senderId_idx" ON "transfers"("senderId");

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
