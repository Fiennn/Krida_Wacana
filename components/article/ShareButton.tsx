"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function ShareButton({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleCopy() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Salin tautan artikel:", window.location.href);
    }
  }

  function handleWhatsApp() {
    if (typeof window === "undefined") return;
    const text = encodeURIComponent(`*${title}*\n\nBaca artikel selengkapnya di:\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleTwitter() {
    if (typeof window === "undefined") return;
    const text = encodeURIComponent(`${title}\n${window.location.href}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleFacebook() {
    if (typeof window === "undefined") return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all active:scale-95 sm:text-sm",
          open
            ? "border-navy-royal bg-navy text-white shadow-sm"
            : "border-line bg-white text-ink hover:border-navy-royal hover:text-navy-royal",
        )}
        aria-label="Bagikan artikel"
        title="Bagikan artikel ini ke media sosial"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>Bagikan</span>
      </button>

      {/* Menu Pilihan Bagikan */}
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Bagikan Lewat
          </p>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.777.781 2.791.781 3.182 0 5.768-2.587 5.768-5.766.001-3.181-2.585-5.767-5.768-5.767zm0-2.172c4.379 0 7.931 3.552 7.931 7.938 0 4.385-3.552 7.938-7.931 7.938-1.341 0-2.607-.34-3.717-.935l-4.314 1.131 1.151-4.208c-.689-1.19-1.051-2.545-1.051-3.926 0-4.386 3.552-7.938 7.931-7.938z" />
              </svg>
            </span>
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleTwitter}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </span>
            <span>Twitter / X</span>
          </button>

          <button
            type="button"
            onClick={handleFacebook}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </span>
            <span>Facebook</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
              copied
                ? "bg-emerald-50 text-emerald-700 font-semibold"
                : "text-slate-700 hover:bg-slate-100 hover:text-navy-royal",
            )}
          >
            <span className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              copied ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600",
            )}>
              {copied ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
              )}
            </span>
            <span>{copied ? "Tautan Berhasil Disalin!" : "Salin Tautan Artikel"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
