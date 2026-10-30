import type { DefaultSession } from "next-auth";

/** Peran pengguna Krida Wacana. */
export type UserRole = "READER" | "PENULIS" | "ADMIN";

/**
 * Augmentasi tipe NextAuth: tambahkan id, username, dan role
 * ke object `user` pada session & jwt.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    username?: string;
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: UserRole;
  }
}
