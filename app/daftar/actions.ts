"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { registerSchema, zodFieldErrors } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

/**
 * Daftar akun baru (username + email + password).
 * Sukses → langsung masuk (redirect). Gagal → tampilkan pesan per biome.
 */
export async function registerAction(
  _prevState:
    | { error?: string; fieldErrors?: Record<string, string> }
    | undefined,
  formData: FormData,
): Promise<{ error?: string; fieldErrors?: Record<string, string> }> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    username: String(formData.get("username") ?? "").toLowerCase(),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error) };
  }

  const { name, username, email, password } = parsed.data;

  // Cek duplikasi email & username dengan pesan yang ramah
  const [emailTerpakai, usernameTerpakai] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);
  if (emailTerpakai) {
    return {
      fieldErrors: { email: "Email ini sudah terdaftar. Coba masuk saja." },
    };
  }
  if (usernameTerpakai) {
    return {
      fieldErrors: {
        username: "Username ini sudah dipakai. Coba yang lain.",
      },
    };
  }

  try {
    await prisma.user.create({
      data: {
        name,
        username,
        email,
        hashedPassword: await bcrypt.hash(password, 12),
        // Akun baru = pembaca. Admin dapat mengubah peran menjadi penulis.
        role: "READER",
      },
    });

    await signIn("credentials", { email, password, redirectTo: "/" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Kendala saat pembuatan akun. Coba lagi sebentar." };
    }
    throw error; // NEXT_REDIRECT dari signIn tetap dilempar
  }
}
