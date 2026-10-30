import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware proteksi jalur.
 * Menggunakan config "ringan" (tanpa Prisma) karena berjalan di Edge Runtime.
 * Jalur terlindungi: /tulis, /dashboard, /tersimpan, /profil, /admin.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/tulis/:path*", "/dashboard/:path*", "/tersimpan/:path*", "/profil/:path*", "/admin/:path*"],
};
