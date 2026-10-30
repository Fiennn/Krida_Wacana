import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { Buffer } from "node:buffer";

/**
 * ============================================================
 * UPLOAD SERVICE KRIDA WACANA
 * ============================================================
 * Satu-satunya file tempat penyimpanan file gambar ditangani —
 * supaya cukup ganti IMPLEMENTASI di bawah jika suatu saat berpindah
 * ke Cloudinary / S3 (interface fungsi tidak berubah).
 *
 * Provider saat ini: local (folder /public/uploads).
 * Untuk ganti provider:
 *   1. Tambahkan branch di `simpanFile()` (mis. upload ke S3 via SDK).
 *   2. Kembalikan URL publik hasilnya.
 *   3. Set UPLOAD_PROVIDER=s3 pada .env bila perlu memilih jalur.
 * ============================================================
 */

export const MAX_UPLOAD_MB = 5;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

/** Tipe file diperbolehkan (beserta ekstensi dan mime-nya) */
const ALLOWED = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type UploadResult = {
  url: string;        // path publik: /uploads/week.jpg
  width: number;
  height: number;
  bytes: number;
  mime: string;
};

export type Preset = "cover" | "article" | "avatar";

/** Resolusi otomatis per penggunaan */
const PRESETS: Record<Preset, { maxWidth: number; quality: number }> = {
  cover: { maxWidth: 1600, quality: 82 },
  article: { maxWidth: 1400, quality: 80 },
  avatar: { maxWidth: 512, quality: 78 },
};

export class UploadError extends Error {}

/** Validasi & kompres/resize gambar, lalu simpan. */
export async function simpanUploadGambar(
  file: File,
  preset: Preset = "article",
): Promise<UploadResult> {
  // ---------- Validasi ----------
  if (!(file instanceof File) || file.size === 0) {
    throw new UploadError("File tidak valid.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`Ukuran gambar melebihi ${MAX_UPLOAD_MB} MB.`);
  }
  const ext = ALLOWED[file.type as keyof typeof ALLOWED];
  if (!ext) {
    throw new UploadError("Format harus JPG, PNG, atau WebP.");
  }

  // ---------- Kompres / resize dengan sharp ----------
  const { maxWidth, quality } = PRESETS[preset];
  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(buffer)
    .rotate() // hormati EXIF orientation
    .resize({ width: maxWidth, height: maxWidth, fit: "inside", withoutEnlargement: true })
    .toFormat("webp", { quality })
    .toBuffer();

  const meta = await sharp(processed).metadata();

  // ---------- Simpan (provider lokal) ----------
  const namaFolder = preset === "avatar" ? "avatar" : preset === "cover" ? "cover" : "artikel";
  const url = await simpanFile(processed, namaFolder, "webp");

  return {
    url,
    width: meta.width ?? maxWidth,
    height: meta.height ?? 0,
    bytes: processed.length,
    mime: "image/webp",
  };
}

/**
 * IMPLEMENTASI PENYIMPANAN (timeout fokus: local disk).
 * Ganti bagian ini untuk Cloudinary/S3 — return harus URL publik.
 */
async function simpanFile(bytes: Buffer, folder: string, ext: string): Promise<string> {
  // provider = local
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  const acak = Math.random().toString(36).slice(2, 8);
  const fileName = `${stamp}-${acak}.${ext}`;

  await fs.writeFile(path.join(dir, fileName), bytes);
  return `/uploads/${folder}/${fileName}`;
}

/** Hapus file lokal bila artikel/gambar dihapus (best effort). */
export async function hapusFileLokal(url?: string | null) {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    const filePath = path.join(process.cwd(), "public", url);
    await fs.unlink(filePath);
  } catch {
    // abaikan jika file sudah tidak ada
  }
}
