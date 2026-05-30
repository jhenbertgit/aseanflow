import type { Job } from "bullmq";
import {
  type PrismaClient,
  type TransferStatus,
  Prisma,
} from "@aseanflow/database";

const STATUS_ORDER_PHP_TO_IDR: TransferStatus[] = [
  "CREATED",
  "QUOTE_LOCKED",
  "INSTA_PAY_PROCESSING",
  "FX_CONVERSION",
  "BI_FAST_PROCESSING",
  "SETTLED",
  "MORPH_ANCHORED",
];

const STATUS_ORDER_IDR_TO_PHP: TransferStatus[] = [
  "CREATED",
  "QUOTE_LOCKED",
  "BI_FAST_PROCESSING",
  "FX_CONVERSION",
  "INSTA_PAY_PROCESSING",
  "SETTLED",
  "MORPH_ANCHORED",
];

function getStatusOrder(sourceCurrency: string): TransferStatus[] {
  return sourceCurrency === "IDR"
    ? STATUS_ORDER_IDR_TO_PHP
    : STATUS_ORDER_PHP_TO_IDR;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createSettlementProcessor(prisma: PrismaClient) {
  async function advanceStatus(
    transferId: string,
    newStatus: TransferStatus,
  ): Promise<void> {
    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    const statusOrder = getStatusOrder(transfer.sourceCurrency);
    const currentIndex = statusOrder.indexOf(transfer.status);
    const newIndex = statusOrder.indexOf(newStatus);

    if (newIndex !== currentIndex + 1) {
      throw new Error(`Invalid transition: ${transfer.status} -> ${newStatus}`);
    }

    await prisma.transfer.update({
      where: { id: transferId },
      data: { status: newStatus },
    });
  }

  return async function processSettlement(
    job: Job<{ transferId: string }>,
  ): Promise<{ transferId: string; status: string }> {
    const { transferId } = job.data;

    const transfer = await prisma.transfer.findUnique({
      where: { trackingCode: transferId },
    });

    if (!transfer) {
      throw new Error(`Transfer with tracking code ${transferId} not found`);
    }

    const id = transfer.id;

    await advanceStatus(id, "QUOTE_LOCKED");
    job.log("Advanced to QUOTE_LOCKED");

    await delay(randomBetween(1000, 1500));
    const instapayRef = `IPY-${Date.now()}`;
    await prisma.transfer.update({
      where: { id },
      data: { instapayRef },
    });
    await advanceStatus(id, "INSTA_PAY_PROCESSING");
    job.log("Advanced to INSTA_PAY_PROCESSING");

    await advanceStatus(id, "FX_CONVERSION");
    job.log("Advanced to FX_CONVERSION");

    await delay(randomBetween(1000, 1500));
    const bifastRef = `BFT-${Date.now()}`;
    await prisma.transfer.update({
      where: { id },
      data: { bifastRef },
    });
    await advanceStatus(id, "BI_FAST_PROCESSING");
    job.log("Advanced to BI_FAST_PROCESSING");

    await advanceStatus(id, "SETTLED");
    job.log("Advanced to SETTLED");

    // Update wallet balances after settlement
    await prisma.$transaction(async (tx) => {
      // 1. Debit sender's source wallet
      if (transfer.senderId) {
        const totalDebit = transfer.sendAmount.plus(transfer.fee);

        const sourceWallet = await tx.accountWallet.findUnique({
          where: {
            userId_currency: {
              userId: transfer.senderId,
              currency: transfer.sourceCurrency,
            },
          },
        });

        if (sourceWallet) {
          await tx.accountWallet.update({
            where: { id: sourceWallet.id },
            data: { balance: { decrement: totalDebit } },
          });
        }

        await tx.ledgerEntry.create({
          data: {
            transferId: id,
            debit: totalDebit,
            credit: new Prisma.Decimal(0),
            currency: transfer.sourceCurrency,
          },
        });
      }

      // 2. Credit recipient by account number (WALLET type)
      if (transfer.recipientType === "WALLET" && transfer.recipientWalletId) {
        const recipientUser = await tx.user.findUnique({
          where: { accountNumber: transfer.recipientWalletId },
        });

        if (recipientUser) {
          await tx.accountWallet.upsert({
            where: {
              userId_currency: {
                userId: recipientUser.id,
                currency: transfer.targetCurrency,
              },
            },
            update: { balance: { increment: transfer.receiveAmount } },
            create: {
              userId: recipientUser.id,
              currency: transfer.targetCurrency,
              balance: transfer.receiveAmount,
            },
          });

          await tx.ledgerEntry.create({
            data: {
              transferId: id,
              debit: new Prisma.Decimal(0),
              credit: transfer.receiveAmount,
              currency: transfer.targetCurrency,
            },
          });
        }
      }
      // BANK transfers: money leaves the system, no credit to any user
    });

    job.log("Updated wallet balances and created ledger entries");

    return { transferId: id, status: "SETTLED" };
  };
}

export default createSettlementProcessor;
