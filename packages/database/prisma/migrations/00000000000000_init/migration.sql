-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "sourceCurrency" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "sendAmount" DECIMAL(18,2) NOT NULL,
    "receiveAmount" DECIMAL(18,2) NOT NULL,
    "exchangeRate" DECIMAL(18,6) NOT NULL,
    "fee" DECIMAL(18,2) NOT NULL,
    "status" TEXT NOT NULL,
    "morphTxHash" TEXT,
    "instapayRef" TEXT,
    "bifastRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "debit" DECIMAL(18,2) NOT NULL,
    "credit" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transfers_trackingCode_key" ON "transfers"("trackingCode");

-- CreateIndex
CREATE INDEX "transfers_trackingCode_idx" ON "transfers"("trackingCode");

-- CreateIndex
CREATE INDEX "ledger_entries_transferId_idx" ON "ledger_entries"("transferId");

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
