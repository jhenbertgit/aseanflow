-- AlterTable
ALTER TABLE "users" ADD COLUMN "accountNumber" TEXT NOT NULL DEFAULT 'AF0000000000';

-- CreateIndex
CREATE UNIQUE INDEX "users_accountNumber_key" ON "users"("accountNumber");
