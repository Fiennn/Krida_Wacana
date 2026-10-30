"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profilSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(60, "Nama maksimal 60 karakter."),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(24, "Username maksimal 24 karakter.")
    .regex(/^[a-z0-9_]+$/i, "Username hanya boleh huruf, angka, dan garis bawah.")
    .transform((v) => v.toLowerCase()),
  bio: z.string().trim().max(500, "Bio maksimal 500 karakter.").optional().default(""),
  image: z.string().trim().optional().nullable(),
});

export type ProfilActionResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

/**
 * Action edit profil: nama, username, bio, dan foto (URL hasil /api/upload).
 * Hanya boleh oleh user yang sedang login; update sesi ikut diperbarui.
 */
export async function updateProfilAction(
  _prev: ProfilActionResult | undefined,
  formData: FormData,
): Promise<ProfilActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sesi berakhir. Silakan masuk kembali." };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    username: String(formData.get("username") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    image: String(formData.get("image") ?? "").trim() || null,
  };

  const parsed = profilSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }
  const { name, username, bio, image } = parsed.data;

  // Username tidak boleh dipakai akun lain
  const bentrok = await prisma.user.findUnique({ where: { username } });
  if (bentrok && bentrok.id !== session.user.id) {
    return {
      fieldErrors: { username: "Username ini sudah dipakai. Coba yang lain." },
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, username, bio: bio || null, image: image ?? session.user.image },
  });

  // Saat foto diganti jadi null tapi sebelumnya ada → hapus file lokal
  if (image === null && session.user.image?.startsWith("/uploads/")) {
    // hanya bila file milik user (di folder avatar) — best effort
    try {
      const { unlink, access } = await import("node:fs/promises");
      const path = await import("node:path");
      const filePath = path.join(process.cwd(), "public", session.user.image);
      await access(filePath);
      await unlink(filePath);
    } catch {
      // abaikan
    }
  }

  // Perbarui data user di UI bila tertampil (halaman publik ikut muat ulang)
  revalidatePath("/profil");
  revalidatePath("/dashboard");
  // Klien juga memanggil `update()` (useSession) agar nama/foto di sesi JWT ikut berubah.
  return { success: true };
}
