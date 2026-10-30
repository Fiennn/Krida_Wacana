"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

/**
 * Server action khusus admin (Tahap 7).
 * Setiap aksi wajib lolos `wajibAdmin()` — pertahanan berlapis
 * selain middleware (yang juga sudah menjaga /admin).
 */

async function wajibAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/masuk?next=/admin");
  }
  return session;
}

/* ------------------------- ARTIKEL ------------------------- */

/** Terbitkan / tarik (unpublish) artikel oleh admin. */
export async function setStatusArtikelAction(formData: FormData) {
  await wajibAdmin();
  const id = String(formData.get("id") ?? "");
  const terbit = String(formData.get("terbit") ?? "") === "1";
  if (!id) return;

  const data = terbit
    ? {
        status: "PUBLISHED",
        publishedAt: new Date(),
      }
    : {
        status: "DRAFT",
      };

  await prisma.article.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/artikel");
  revalidatePath("/");
}

/** Hapus permanen artikel (beserta komentar, like, bookmark — cascade). */
export async function hapusArtikelAdminAction(formData: FormData) {
  await wajibAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.article.delete({ where: { id } });

  revalidatePath("/admin/artikel");
  revalidatePath("/");
}

/* ------------------------- KOMENTAR ------------------------- */

/** Sembunyikan / tampilkan balik komentar moderator (hidden flag). */
export async function setStatusKomentarAction(formData: FormData) {
  await wajibAdmin();
  const id = String(formData.get("id") ?? "");
  const sembunyi = String(formData.get("sembunyi") ?? "") === "1";
  if (!id) return;

  await prisma.comment.update({
    where: { id },
    data: { hidden: sembunyi },
  });

  revalidatePath("/admin/komentar");
}

/** Hapus permanen komentar (balasan ikut terhapus bila induk). */
export async function hapusKomentarAdminAction(formData: FormData) {
  await wajibAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.comment.delete({ where: { id } });

  revalidatePath("/admin/komentar");
}

/* ------------------------- KATEGORI ------------------------- */

export type KategoriFormState = {
  error?: string;
  sukses?: string;
};

/** Tambah kategori baru. */
export async function buatKategoriAction(
  _prevState: KategoriFormState | undefined,
  formData: FormData,
): Promise<KategoriFormState> {
  await wajibAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 40) {
    return { error: "Nama kategori harus 2–40 karakter." };
  }

  const slug = slugify(name);
  if (!slug) {
    return { error: "Nama kategori tidak bisa dijadikan URL." };
  }

  const sudahNama = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (sudahNama) {
    return { error: "Kategori dengan nama/slug itu sudah ada." };
  }

  await prisma.category.create({
    data: {
      name,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
    },
  });

  revalidatePath("/admin/kategori");
  revalidatePath("/");
  return { sukses: `Kategori "${name}" berhasil dibuat.` };
}

/** Ubah nama kategori. */
export async function ubahKategoriAction(formData: FormData) {
  await wajibAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || name.length < 2 || name.length > 40) return;

  const slug = slugify(name);
  if (!slug) return;

  const bentrok = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }], NOT: { id } },
  });
  if (bentrok) {
    // Nama sudah dipakai kategori lain — diabaikan agar aman
    revalidatePath("/admin/kategori");
    return;
  }

  await prisma.category.update({
    where: { id },
    data: { name, slug },
  });

  revalidatePath("/admin/kategori");
  revalidatePath("/");
}

/** Hapus kategori (ditolak bila masih ada artikel di dalamnya). */
export async function hapusKategoriAction(formData: FormData) {
  await wajibAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const dipakai = await prisma.article.count({ where: { categoryId: id } });
  if (dipakai > 0) {
    // Skema memakai onDelete: Restrict — hapus hanya bila tidak dipakai
    revalidatePath("/admin/kategori");
    return;
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/kategori");
  revalidatePath("/");
}

/* ------------------------- PENGGUNA ------------------------- */

/** Alihkan peran user: READER (pembaca) | PENULIS | ADMIN. */
export async function ubahPeranAction(formData: FormData) {
  await wajibAdmin();
  const id = String(formData.get("id") ?? "");
  const roleDiminta = String(formData.get("role") ?? "");
  const role =
    roleDiminta === "ADMIN" || roleDiminta === "PENULIS" ? roleDiminta : "READER";
  if (!id) return;

  // Jangan biarkan tidak ada admin tersisa
  if (role !== "ADMIN") {
    const adminTersisa = await prisma.user.findMany({
      where: { role: "ADMIN", id: { not: id } },
      select: { id: true },
    });
    if (adminTersisa.length === 0) {
      // Admin terakhir — jangan alihkan perannya
      revalidatePath("/admin/pengguna");
      return;
    }
  }

  await prisma.user.update({
    where: { id },
    data: { role },
  });

  revalidatePath("/admin/pengguna");
}
