"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BrandLogo from "@/components/brand/BrandLogo";
import UserMenu from "@/components/layout/UserMenu";
import { HEADER_NAV, SCHOOL_NAME_UPPER } from "@/lib/constants";
import { cn } from "@/lib/utils";

type UserProp = {
  name?: string | null;
  image?: string | null;
  username?: string;
  role?: string;
} | null;

/** Role yang boleh menulis artikel (guru/siswa terpilih). */
function bolehMenulis(user: UserProp) {
  return user?.role === "ADMIN" || user?.role === "PENULIS";
}

export default function HeaderClient({ user }: { user: UserProp }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ---------- Top bar (navy gelap) ---------- */}
      <div className="bg-navy-dark">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[11px] text-white/70 sm:px-6">
          <p className="min-w-0 truncate font-semibold tracking-[0.08em]">
            <span className="sm:hidden">SD Negeri 2 Kemutug Lor</span>
            <span className="hidden sm:inline">{SCHOOL_NAME_UPPER}</span>
          </p>
          <div className="flex shrink-0 items-center gap-4 pl-3">
            {bolehMenulis(user) && (
              <>
                <Link href="/tulis" className="hidden transition-colors hover:text-amber-brand sm:block">
                  Tulis Artikel
                </Link>
                <span className="hidden h-3 w-px bg-white/20 sm:block" aria-hidden />
              </>
            )}
            <Link href="/cari" className="transition-colors hover:text-amber-brand">
              Pencarian
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- Header utama (navy) ---------- */}
      <div className="border-b border-white/10 bg-navy/95 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <BrandLogo variant="light" />

          {/* Navigasi desktop */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {HEADER_NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/10 text-amber-brand"
                      : "text-white/80 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Aksi kanan: Masuk/Daftar (belum login) atau avatar (login) */}
          <div className="flex shrink-0 items-center gap-2.5">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/masuk"
                  className={cn(
                    "hidden h-10 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white sm:inline-flex",
                    "bg-white/10 backdrop-blur transition-all hover:border-white/40 hover:bg-white/20",
                  )}
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-full bg-amber-brand px-4 text-xs font-bold text-navy-dark shadow-sm sm:h-10 sm:px-5 sm:text-sm",
                    "transition-all hover:bg-amber-highlight hover:shadow-md active:scale-95",
                  )}
                >
                  Daftar
                </Link>
              </>
            )}

            {/* Tombol menu mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 lg:hidden"
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                {mobileOpen ? (
                  <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Panel menu mobile */}
        {mobileOpen && (
          <nav
            className="border-t border-white/10 bg-navy-dark px-4 py-3 lg:hidden"
            aria-label="Navigasi mobile"
          >
            <ul className="flex flex-col">
              {HEADER_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {bolehMenulis(user) && (
                <li className="mt-1 border-t border-white/10 pt-1">
                  <Link
                    href="/tulis"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-amber-brand transition-colors hover:bg-white/10"
                  >
                    Tulis Artikel
                  </Link>
                </li>
              )}
              {!user && (
                <li className="mt-1 border-t border-white/10 pt-1">
                  <Link
                    href="/masuk"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-amber-brand transition-colors hover:bg-white/10"
                  >
                    Masuk
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
