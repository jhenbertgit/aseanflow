-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('PHP', 'IDR');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('CREATED', 'QUOTE_LOCKED', 'INSTA_PAY_PROCESSING', 'FX_CONVERSION', 'BI_FAST_PROCESSING', 'SETTLED', 'MORPH_ANCHORED');

-- AlterTable: transfers — convert TEXT columns to enum types
ALTER TABLE "transfers" ALTER COLUMN "sourceCurrency" TYPE "Currency" USING "sourceCurrency"::"Currency";
ALTER TABLE "transfers" ALTER COLUMN "targetCurrency" TYPE "Currency" USING "targetCurrency"::"Currency";
ALTER TABLE "transfers" ALTER COLUMN "status" TYPE "TransferStatus" USING "status"::"TransferStatus";

-- AlterTable: ledger_entries — convert TEXT column to enum type
ALTER TABLE "ledger_entries" ALTER COLUMN "currency" TYPE "Currency" USING "currency"::"Currency";
