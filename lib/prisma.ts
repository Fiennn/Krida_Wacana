import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient:
 * Terhubung ke database PostgreSQL (Neon / cloud Postgres).
 * Menyediakan fallback otomatis ke cloud database jika DATABASE_URL di Vercel belum diisi manual.
 */
const FALLBACK_DATABASE_URL =
  "postgresql://neondb_owner:npg_y0Zqbru2nwRv@ep-damp-hall-azirqoo4-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const dbUrl = process.env.DATABASE_URL || FALLBACK_DATABASE_URL;
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
