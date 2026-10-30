import { prisma } from "@/lib/prisma";

/**
 * Generator username unik dari nama/email (memakai base yang sudah bersih).
 * Dipakai saat login Google pertama kali.
 */
export async function generateUniqueUsername(base: string): Promise<string> {
  const bersih = base
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);

  const kandidatAwal = bersih.length >= 3 ? bersih : `penulis${bersih || ""}`;

  // Coba base langsung
  if (!(await prisma.user.findUnique({ where: { username: kandidatAwal } }))) {
    return kandidatAwal;
  }

  // Jika terpakai, tambahkan angka acak hingga ketemu
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const kandidat = `${kandidatAwal.slice(0, 14)}${suffix}`;
    if (!(await prisma.user.findUnique({ where: { username: kandidat } }))) {
      return kandidat;
    }
  }

  // Jaminan terakhir: pakai timestamp
  return `${kandidatAwal.slice(0, 12)}${Date.now().toString(36)}`;
}

/** Bangun base untuk username dari nama atau email Google. */
export function usernameBaseFrom(nameOrEmail: string): string {
  const bagian = nameOrEmail.includes("@")
    ? nameOrEmail.split("@")[0]
    : nameOrEmail;
  return bagian
    .replace(/[\s.]+/g, "") // hapus spasi dan titik
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}
