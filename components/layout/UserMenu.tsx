"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Avatar + nama user dengan dropdown:
 * Profil Saya, Tulisan Saya, Tulis Artikel, Tersimpan, Keluar
 * (+ Panel Admin jika role ADMIN).
 */
export default function UserMenu({
  user,
}: {
  user: { name?: string | null; image?: string | null; username?: string; role?: string };
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar / tekan Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const menuItems = [
    { label: "Profil Saya", href: "/profil" },
    { label: "Tulisan Saya", href: "/dashboard" },
    ...(user.role === "ADMIN" || user.role === "PENULIS"
      ? [{ label: "Tulis Artikel", href: "/tulis" }]
      : []),
    { label: "Tersimpan", href: "/tersimpan" },
    ...(user.role === "ADMIN" ? [{ label: "Panel Admin", href: "/admin" }] : []),
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 py-1 pl-1 pr-3 backdrop-blur transition-all hover:border-white/35 hover:bg-white/20",
          open && "border-white/40 bg-white/20",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {/* Avatar */}
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Avatar"}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-brand text-sm font-bold text-navy-dark">
            {(user.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-44 truncate text-sm font-semibold text-white sm:block sm:max-w-56">
          {user.name ?? user.username}
        </span>
        <svg
          className={cn("h-4 w-4 text-white/60 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-white/20 bg-[#07142f] shadow-2xl backdrop-blur-xl animate-fade-in"
        >
          {/* Kunci identitas */}
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm font-bold text-white">{user.name}</p>
            <p className="mt-0.5 truncate text-xs text-white/50">@{user.username}</p>
          </div>

          <nav className="p-1.5" aria-label="Menu user">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-amber-brand"
              >
                {item.label}
              </Link>
            ))}

            {/* Keluar */}
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ redirectTo: "/" })}
              className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-white/10 px-3 py-2.5 pt-3 text-left text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/15"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m5-4-4 4 4 4m7-11h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
              </svg>
              Keluar
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
