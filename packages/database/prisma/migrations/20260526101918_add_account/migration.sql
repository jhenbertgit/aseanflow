-- DropIndex
DROP INDEX "account_wallets_userId_idx";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "accountNumber" DROP DEFAULT;
