import { z } from "zod";

/**
 * Skema validasi bersama untuk form (dipakai server action & client).
 * Semua pesan error ditulis dalam Bahasa Indonesia dan ramah pembaca.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  password: z
    .string()
    .min(1, "Password wajib diisi."),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(60, "Nama maksimal 60 karakter."),
    username: z
      .string()
      .trim()
      .min(3, "Username minimal 3 karakter.")
      .max(24, "Username maksimal 24 karakter.")
      .regex(/^[a-z0-9_]+$/i, "Username hanya boleh berisi huruf, angka, dan garis bawah."),
    email: z
      .string()
      .trim()
      .min(1, "Email wajib diisi.")
      .email("Format email tidak valid."),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .max(72, "Password maksimal 72 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/** Ubah error Zod menjadi map { namaField: pesan } untuk ditampilkan di form. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
