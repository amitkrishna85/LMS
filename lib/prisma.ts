import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Defensive query wrapper to prevent build-time crashes when running without a live database.
 */
export async function safeDbQuery<T>(
  queryFn: () => Promise<T>,
  fallbackValue: any
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.warn("safeDbQuery caught error (likely build without live DB):", error);
    return fallbackValue;
  }
}
