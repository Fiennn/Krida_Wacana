import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

/**
 * Konfigurasi lengkap Auth.js:
 * - Provider Credentials (email + password) untuk login akun internal/demo.
 * - Sesi disimpan sebagai JWT di cookie (strategi "jwt") tanpa butuh database adapter eksternal.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email dan Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.hashedPassword) return null; // akun dari Google, tanpa password

        const cocok = await bcrypt.compare(password, user.hashedPassword);
        if (!cocok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
          role: user.role as "READER" | "PENULIS" | "ADMIN",
        };
      },
    }),
  ],
  callbacks: {
    // jwt & session callback ada di lib/auth.config.ts agar middleware
    // (Edge Runtime) juga bisa membaca peran pengguna.
    ...authConfig.callbacks,
  },
  events: {
    async signIn() {
      // placeholder untuk log analitik bila dibutuhkan
    },
  },
});
