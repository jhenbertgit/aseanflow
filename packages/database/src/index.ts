import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

export { PrismaClient };
export { Prisma } from "../generated/prisma/client.js";
export { TransferStatus, Currency } from "../generated/prisma/enums.js";

export function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const url = new URL(connectionString);
  const adapter = new PrismaPg({
    host: url.hostname,
    port: Number(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });

  return new PrismaClient({ adapter });
}
