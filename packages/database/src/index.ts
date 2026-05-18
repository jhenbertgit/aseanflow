import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

export { PrismaClient };
export type { Prisma } from "../generated/prisma/index.js";

export function createPrismaClient(
  options?: ConstructorParameters<typeof PrismaClient>[0],
) {
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

  return new PrismaClient({
    ...options,
    adapter,
  });
}
