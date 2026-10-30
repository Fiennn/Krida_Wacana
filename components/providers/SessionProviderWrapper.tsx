"use client";

// Pembungkus SessionProvider (client) supaya bisa dipakai di root layout server
import { SessionProvider } from "next-auth/react";

export default function SessionProviderWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
