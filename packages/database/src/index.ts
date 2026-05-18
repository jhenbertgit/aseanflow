import { PrismaClient } from "../generated/prisma/index.js";

export { PrismaClient };
export type { Prisma } from "../generated/prisma/index.js";

/**
 * Create a PrismaClient with the pg driver adapter for Prisma 7.
 */
export function createPrismaClient(
  options?: ConstructorParameters<typeof PrismaClient>[0],
) {
  return new PrismaClient({
    ...options,
  });
}
