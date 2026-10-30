import { z } from "zod";

/**
 * Skema validasi tulis/edit artikel.
 * Dipakai bersama oleh client (editor) dan server (route handler).
 */
export const artikeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(8, "Judul minimal 8 karakter.")
    .max(140, "Judul maksimal 140 karakter."),
  excerpt: z
    .string()
    .trim()
    .max(300, "Ringkasan maksimal 300 karakter.")
    .optional()
    .default(""),
  content: z
    .string()
    .min(50, "Isi artikel terlalu pendek (minimal 50 karakter)."),
  coverImage: z.string().trim().optional().nullable(),
  categorySlug: z.string().trim().min(1, "Pilih kategori tulisanmu."),
  tags: z.array(z.string().trim().min(1).max(30)).max(8, "Maksimal 8 tag.").default([]),
  galleryUrls: z.array(z.string().trim()).max(12, "Galeri maksimal 12 foto.").default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export type ArtikeInput = z.infer<typeof artikeSchema>;

export const artikelUpdateSchema = artikeSchema.partial().extend({
  id: z.string().min(1),
});

export type ArtikeUpdateInput = z.infer<typeof artikelUpdateSchema>;

/** Ekstrak pesan pertama dari error Zod untuk pesan user yang ramah. */
export function zodFirstMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Data yang dikirim tidak valid.";
}
