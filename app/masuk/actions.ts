"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

/** Ambil URL tujuan setelah login (callbackUrl > referer > beranda). */
async function resolveCallbackUrl(explicit?: string): Promise<string> {
  if (explicit?.startsWith("/") && !explicit.startsWith("//")) return explicit;

  const headersList = await headers();
  const referer = headersList.get("referer");

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.pathname !== "/masuk" && refererUrl.pathname !== "/daftar") {
        return refererUrl.pathname + refererUrl.search;
      }
    } catch {
      // referer tidak valid — lanjut ke fallback
    }
  }
  return "/";
}

/**
 * Login email + password.
 * Sukses → redirect ke callbackUrl. Gagal → tampilkan pesan ramah.
 */
export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrlRaw = String(formData.get("callbackUrl") ?? "");

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: "Periksa kembali email dan password yang kamu masukkan." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: await resolveCallbackUrl(callbackUrlRaw || undefined),
    });
    return {}; // tak tercapai (redirect terlempar)
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        const cek = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (cek && !cek.hashedPassword) {
          return {
            error: "Akun ini dibuat lewat Google. Silakan masuk dengan tombol Google.",
          };
        }
        return { error: "Email atau password yang kamu masukkan salah." };
      }
      return { error: "Terjadi kendala saat masuk. Coba lagi sebentar." };
    }
    throw error; // lempar ulang error redirect NEXT_REDIRECT
  }
}
