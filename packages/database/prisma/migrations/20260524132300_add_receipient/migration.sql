-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('WALLET', 'BANK');

-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "recipientAccount" TEXT,
ADD COLUMN     "recipientBank" TEXT,
ADD COLUMN     "recipientName" TEXT,
ADD COLUMN     "recipientType" "RecipientType" NOT NULL DEFAULT 'WALLET',
ADD COLUMN     "recipientWalletId" TEXT;
