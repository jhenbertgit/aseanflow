-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "encryptedPrivateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex
CREATE INDEX "wallets_address_idx" ON "wallets"("address");

-- AlterTable: add wallet + reward columns to transfers
ALTER TABLE "transfers" ADD COLUMN "walletId" TEXT;
ALTER TABLE "transfers" ADD COLUMN "rewardTxHash" TEXT;
ALTER TABLE "transfers" ADD COLUMN "rewardAmount" DECIMAL(48,18);

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
