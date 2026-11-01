import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient (PostgreSQL / Neon).
 *
 * Koneksi diambil dari environment variable `DATABASE_URL`:
 *   - Lokal  : isi di file `.env`
 *   - Vercel : isi di Project Settings -> Environment Variables
 *
 * Jangan menulis connection string langsung di file ini — kredensial
 * database tidak boleh masuk ke repository.
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
