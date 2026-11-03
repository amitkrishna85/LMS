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
    if (process.env.DATABASE_URL) {
      throw error;
    }
    if (
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PHASE !== "phase-production-build"
    ) {
      throw new Error(
        "DATABASE_URL must be configured in production to persist application data."
      );
    }
    return fallbackValue;
  }
}
