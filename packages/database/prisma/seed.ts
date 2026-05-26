import { createPrismaClient } from "../src/index.js";

async function main() {
  const prisma = createPrismaClient();

  const user = await prisma.user.upsert({
    where: { accountNumber: "AF0000000000" },
    update: {},
    create: {
      accountNumber: "AF0000000000",
      name: "Default User",
      email: "default@aseanflow.test",
      cookieToken: "seed-default-token",
      wallets: {
        create: [
          { currency: "PHP", balance: "100000.00" },
          { currency: "IDR", balance: "0.00" },
        ],
      },
    },
  });

  console.log("Seeded default user:", user.accountNumber);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
