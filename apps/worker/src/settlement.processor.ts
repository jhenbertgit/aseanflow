import type { Job } from "bullmq";
import { createPrismaClient } from "@aseanflow/database";
import type { TransferStatus } from "@aseanflow/database";

const prisma = createPrismaClient();

const STATUS_ORDER: TransferStatus[] = [
  "CREATED",
  "QUOTE_LOCKED",
  "INSTA_PAY_PROCESSING",
  "FX_CONVERSION",
  "BI_FAST_PROCESSING",
  "SETTLED",
  "MORPH_ANCHORED",
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

  const currentIndex = STATUS_ORDER.indexOf(transfer.status);
  const newIndex = STATUS_ORDER.indexOf(newStatus);

  if (newIndex !== currentIndex + 1) {
    throw new Error(`Invalid transition: ${transfer.status} -> ${newStatus}`);
  }

  await prisma.transfer.update({
    where: { id: transferId },
    data: { status: newStatus },
  });
}

export async function processSettlement(
  job: Job<{ transferId: string }>,
): Promise<{ transferId: string; status: string }> {
  const { transferId } = job.data;

  // Look up by tracking code to get internal ID
  const transfer = await prisma.transfer.findUnique({
    where: { trackingCode: transferId },
  });

  if (!transfer) {
    throw new Error(`Transfer with tracking code ${transferId} not found`);
  }

  const id = transfer.id;

  await advanceStatus(id, "QUOTE_LOCKED");
  job.log("Advanced to QUOTE_LOCKED");

  // InstaPay simulation
  await delay(randomBetween(1000, 1500));
  const instapayRef = `IPY-${Date.now()}`;
  await prisma.transfer.update({
    where: { id },
    data: { instapayRef },
  });
  await advanceStatus(id, "INSTA_PAY_PROCESSING");
  job.log("Advanced to INSTA_PAY_PROCESSING");

  // FX Conversion
  await advanceStatus(id, "FX_CONVERSION");
  job.log("Advanced to FX_CONVERSION");

  // BI-FAST simulation
  await delay(randomBetween(1000, 1500));
  const bifastRef = `BFT-${Date.now()}`;
  await prisma.transfer.update({
    where: { id },
    data: { bifastRef },
  });
  await advanceStatus(id, "BI_FAST_PROCESSING");
  job.log("Advanced to BI_FAST_PROCESSING");

  // SETTLED
  await advanceStatus(id, "SETTLED");
  job.log("Advanced to SETTLED");

  return { transferId: id, status: "SETTLED" };
}

export default processSettlement;
