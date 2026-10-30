import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { UserRole } from "@/types/next-auth";

/**
 * Konfigurasi dasar Auth.js.
 *
 * File ini TANPA import Prisma agar aman dipakai di Edge Runtime
 * (middleware). Konfigurasi lengkap (adapter, credentials, event)
 * ada di `lib/auth.ts`.
 *
 * Catatan penting: callback `jwt` dan `session` HARUS ada di sini,
 * karena middleware memakai config ini untuk membaca peran pengguna.
 * Tanpa callback ini `session.user.role` selalu kosong di middleware,
 * sehingga /admin dan /tulis ikut menolak admin/penulis.
 */
export const authConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    "dev-only-secret-krida-wacana-7d1f39b2c8a4e6f0b5d2a9c3e1f8b6d4",
  pages: {
    signIn: "/masuk",
    error: "/masuk", // OAuth error dikirim balik ke halaman masuk
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== "ISI-CLIENT-ID-GOOGLE"
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: { prompt: "select_account" },
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    // Simpan id, username, dan role ke dalam isi jwt
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? "";
        token.role = user.role ?? "READER";
      }
      // Sinkronkan profil setelah edit profil
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.picture = session.picture ?? token.picture;
        token.username = session.username ?? token.username;
      }
      return token;
    },
    // Pindahkan isi jwt ke object session yang dibaca UI & middleware
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = (token.username as string) || "";
        session.user.role = (token.role as UserRole) || "READER";
      }
      return session;
    },
    // Guard jalur (juga dipakai middleware)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      const jalurLogin = ["/dashboard", "/tersimpan", "/profil"];
      const jalurAdmin = "/admin";
      const jalurTulis = "/tulis";

      if (path.startsWith(jalurAdmin)) {
        return role === "ADMIN";
      }
      // Menulis hanya untuk guru/siswa yang disetujui admin
      if (path.startsWith(jalurTulis)) {
        return role === "ADMIN" || role === "PENULIS";
      }
      if (jalurLogin.some((p) => path.startsWith(p))) {
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
