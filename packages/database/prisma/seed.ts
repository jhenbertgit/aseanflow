import { Prisma, createPrismaClient } from "../src/index.js";

const prisma = createPrismaClient();

const DEMO_COOKIE_TOKEN = "af_demo_session_token_2026";

async function seedDemoUser() {
  const user = await prisma.user.upsert({
    where: { email: "juan@aseanflow.demo" },
    update: {},
    create: {
      name: "Juan Dela Cruz",
      email: "juan@aseanflow.demo",
      cookieToken: DEMO_COOKIE_TOKEN,
    },
  });

  console.log(`Seeded user: ${user.name} (${user.email})`);

  // Upsert wallets
  const phpWallet = await prisma.accountWallet.upsert({
    where: { userId_currency: { userId: user.id, currency: "PHP" } },
    update: {},
    create: {
      userId: user.id,
      currency: "PHP",
      balance: new Prisma.Decimal("72500.00"),
    },
  });

  const idrWallet = await prisma.accountWallet.upsert({
    where: { userId_currency: { userId: user.id, currency: "IDR" } },
    update: {},
    create: {
      userId: user.id,
      currency: "IDR",
      balance: new Prisma.Decimal("2890600.00"),
    },
  });

  console.log(`  PHP wallet: ₱${phpWallet.balance}`);
  console.log(`  IDR wallet: Rp ${idrWallet.balance}`);

  // Seed transfers in various states
  const transfers = [
    {
      trackingCode: "TXNDEMO001",
      sendAmount: "5000.00",
      receiveAmount: "1445480.00",
      exchangeRate: "289.096000",
      fee: "10.00",
      status: "MORPH_ANCHORED" as const,
      morphTxHash: "0x" + "a".repeat(64),
      instapayRef: "IPSDEMO1234",
      bifastRef: "BIFDEMO5678",
      hoursAgo: 48,
    },
    {
      trackingCode: "TXNDEMO002",
      sendAmount: "10000.00",
      receiveAmount: "2890000.00",
      exchangeRate: "289.000000",
      fee: "15.00",
      status: "SETTLED" as const,
      morphTxHash: "0x" + "b".repeat(64),
      instapayRef: null,
      bifastRef: null,
      hoursAgo: 24,
    },
    {
      trackingCode: "TXNDEMO003",
      sendAmount: "3000.00",
      receiveAmount: "867000.00",
      exchangeRate: "289.000000",
      fee: "8.00",
      status: "BI_FAST_PROCESSING" as const,
      morphTxHash: null,
      instapayRef: null,
      bifastRef: null,
      hoursAgo: 2,
    },
    {
      trackingCode: "TXNDEMO004",
      sendAmount: "7500.00",
      receiveAmount: "2167500.00",
      exchangeRate: "289.000000",
      fee: "12.00",
      status: "QUOTE_LOCKED" as const,
      morphTxHash: null,
      instapayRef: null,
      bifastRef: null,
      hoursAgo: 0.5,
    },
    {
      trackingCode: "TXNDEMO005",
      sendAmount: "2000.00",
      receiveAmount: "578000.00",
      exchangeRate: "289.000000",
      fee: "5.00",
      status: "CREATED" as const,
      morphTxHash: null,
      instapayRef: null,
      bifastRef: null,
      hoursAgo: 0.1,
    },
  ];

  for (const t of transfers) {
    const created = new Date(Date.now() - t.hoursAgo * 3600 * 1000);

    await prisma.transfer.upsert({
      where: { trackingCode: t.trackingCode },
      update: {},
      create: {
        trackingCode: t.trackingCode,
        sourceCurrency: "PHP",
        targetCurrency: "IDR",
        sendAmount: new Prisma.Decimal(t.sendAmount),
        receiveAmount: new Prisma.Decimal(t.receiveAmount),
        exchangeRate: new Prisma.Decimal(t.exchangeRate),
        fee: new Prisma.Decimal(t.fee),
        status: t.status,
        senderId: user.id,
        morphTxHash: t.morphTxHash,
        instapayRef: t.instapayRef,
        bifastRef: t.bifastRef,
        recipientType: "BANK",
        recipientName: "Budi Santoso",
        recipientBank: "BCA",
        recipientAccount: "1234567890",
        createdAt: created,
      },
    });

    // Create ledger entries if they don't exist
    const transfer = await prisma.transfer.findUnique({
      where: { trackingCode: t.trackingCode },
    });
    if (!transfer) continue;

    const existingEntries = await prisma.ledgerEntry.findMany({
      where: { transferId: transfer.id },
    });

    if (existingEntries.length === 0) {
      await prisma.ledgerEntry.createMany({
        data: [
          {
            transferId: transfer.id,
            debit: new Prisma.Decimal(t.sendAmount),
            credit: new Prisma.Decimal("0.00"),
            currency: "PHP",
          },
          {
            transferId: transfer.id,
            debit: new Prisma.Decimal("0.00"),
            credit: new Prisma.Decimal(t.receiveAmount),
            currency: "IDR",
          },
        ],
      });
    }

    console.log(
      `  Transfer ${t.trackingCode}: ₱${t.sendAmount} → Rp ${t.receiveAmount} [${t.status}]`,
    );
  }

  console.log(`\nCookie token: ${DEMO_COOKIE_TOKEN}`);
  console.log("Seed complete.");
}

async function main() {
  console.log("Seeding database...");
  await seedDemoUser();
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
