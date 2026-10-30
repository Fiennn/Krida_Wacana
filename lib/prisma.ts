import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient:
 * - Pada production, satu instance dipakai global (hemat koneksi).
 * - Pada development, instance disimpan di globalThis agar tidak
 *   membuat koneksi baru tiap kali file di-reload oleh HMR.
 *
 * Tabel DATABASE_URL di .env menentukan database yang dipakai:
 * - SQLite (development): file:./dev.db
 * - PostgreSQL (production): postgresql://user:pass@host:5432/db
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
