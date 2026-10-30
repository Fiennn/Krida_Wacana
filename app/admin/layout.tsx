import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { ReactNode } from "react";

/**
 * Shell panel admin: sidebar navigasi + konten.
 * Middleware sudah menjaga /admin agar hanya ADMIN — ini pertahanan kedua.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const nav = [
    { href: "/admin", label: "Ringkasan", icon: "grid" },
    { href: "/admin/track-record", label: "Track Record", icon: "chart" },
    { href: "/admin/artikel", label: "Artikel", icon: "doc" },
    { href: "/admin/komentar", label: "Komentar", icon: "chat" },
    { href: "/admin/kategori", label: "Kategori", icon: "tag" },
    { href: "/admin/pengguna", label: "Pengguna", icon: "users" },
  ] as const;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-56 lg:shrink-0">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card lg:sticky lg:top-24">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-secondary">
            Panel Admin
          </p>
          <p className="mt-1 truncate font-serif text-lg font-bold text-ink">
            {session.user.name ?? "Admin"}
          </p>

          <nav className="mt-4 flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted hover:text-navy-royal"
              >
                <AdminIcon name={item.icon} />
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="mt-4 block rounded-xl bg-surface-muted px-3 py-2 text-center text-xs font-semibold text-ink-secondary transition-colors hover:text-navy-royal"
          >
            ← Kembali ke situs
          </Link>
        </div>
      </aside>

      {/* Konten */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function AdminIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    grid: "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z",
    chart: "M3 3v18h18M7 16l4-4 4 4 5-6",
    doc: "M14 3v5h5M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8l-4-5z",
    chat: "M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z",
    tag: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7 7h.01",
    users:
      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  };
  return (
    <svg
      className="h-4 w-4 shrink-0 text-ink-secondary"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d={paths[name]} />
    </svg>
  );
}
