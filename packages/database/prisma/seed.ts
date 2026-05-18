import { PrismaClient, Prisma } from "../src/index.js";

const prisma = new PrismaClient();

async function seedDemoTransfer() {
  const transfer = await prisma.transfer.upsert({
    where: { trackingCode: "TXNDEMO001" },
    update: {},
    create: {
      trackingCode: "TXNDEMO001",
      sourceCurrency: "PHP",
      targetCurrency: "IDR",
      sendAmount: new Prisma.Decimal("5000.00"),
      receiveAmount: new Prisma.Decimal("1445480.00"),
      exchangeRate: new Prisma.Decimal("289.200000"),
      fee: new Prisma.Decimal("10.00"),
      status: "MORPH_ANCHORED",
      morphTxHash: "0x" + "a".repeat(64),
      instapayRef: "IPSDEMO1234",
      bifastRef: "BIFDEMO5678",
    },
  });

  // Only create ledger entries if they don't exist for this transfer
  const existingEntries = await prisma.ledgerEntry.findMany({
    where: { transferId: transfer.id },
  });

  if (existingEntries.length === 0) {
    await prisma.ledgerEntry.createMany({
      data: [
        {
          transferId: transfer.id,
          debit: new Prisma.Decimal("5000.00"),
          credit: new Prisma.Decimal("0.00"),
          currency: "PHP",
        },
        {
          transferId: transfer.id,
          debit: new Prisma.Decimal("0.00"),
          credit: new Prisma.Decimal("1445480.00"),
          currency: "IDR",
        },
      ],
    });
  }

  console.log(`Seeded demo transfer: ${transfer.trackingCode}`);
  console.log(
    `Visit /transfer/${transfer.trackingCode} to see completed transfer`,
  );
}

async function main() {
  console.log("Seeding database...");
  await seedDemoTransfer();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
