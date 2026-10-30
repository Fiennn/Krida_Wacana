"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

type Props = {
  htmlContent: string;
};

export default function ArticleContent({ htmlContent }: Props) {
  const contentId = useId();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [tocOpen, setTocOpen] = useState(true);
  const [textSize, setTextSize] = useState<"base" | "lg" | "xl">("base");

  // Ekstrak heading dari DOM setelah mount untuk membuat daftar isi otomatis
  useEffect(() => {
    const container = document.getElementById(contentId);
    if (!container) return;

    const elements = container.querySelectorAll("h2, h3");
    const items: HeadingItem[] = [];

    elements.forEach((el, index) => {
      const text = el.textContent?.trim() || "";
      if (!text) return;

      // Berikan ID unik jika belum ada
      let id = el.id;
      if (!id) {
        id = `section-${index + 1}-${text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 40)}`;
        el.id = id;
      }

      items.push({
        id,
        text,
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);
  }, [htmlContent, contentId]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const yOffset = -90; // offset untuk sticky navbar
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      {/* Pengatur Ukuran Huruf & Aksesibilitas Pembaca */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs text-ink-secondary">
        <span className="flex items-center gap-1.5 font-medium">
          <svg className="h-4 w-4 text-navy-royal" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          Ukuran Teks Bacaan:
        </span>

        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/60">
          <button
            type="button"
            onClick={() => setTextSize("base")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              textSize === "base"
                ? "bg-navy text-white shadow-sm"
                : "text-slate-600 hover:text-navy hover:bg-slate-50",
            )}
            title="Ukuran standar"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setTextSize("lg")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              textSize === "lg"
                ? "bg-navy text-white shadow-sm"
                : "text-slate-600 hover:text-navy hover:bg-slate-50",
            )}
            title="Ukuran lebih besar"
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setTextSize("xl")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              textSize === "xl"
                ? "bg-navy text-white shadow-sm"
                : "text-slate-600 hover:text-navy hover:bg-slate-50",
            )}
            title="Ukuran sangat besar"
          >
            A++
          </button>
        </div>
      </div>

      {/* Daftar Isi Otomatis (jika ada 2 heading atau lebih) */}
      {headings.length >= 2 && (
        <nav
          aria-label="Daftar Isi Artikel"
          className="overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-amber-50/20 to-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-brand/20 text-navy-dark">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              </span>
              <h2 className="!my-0 !border-0 !p-0 font-serif text-base font-bold text-navy-dark sm:text-lg">
                Daftar Isi Tulisan
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setTocOpen(!tocOpen)}
              className="text-xs font-semibold text-navy-royal hover:underline"
            >
              {tocOpen ? "Sembunyikan" : "Tampilkan"}
            </button>
          </div>

          {tocOpen && (
            <ol className="mt-3.5 space-y-2 border-t border-amber-200/50 pt-3 text-sm text-slate-700">
              {headings.map((h, i) => (
                <li
                  key={h.id}
                  className={cn(
                    "flex items-baseline gap-2 transition-colors hover:text-navy-royal",
                    h.level === 3 ? "pl-5 text-xs text-slate-600" : "font-medium",
                  )}
                >
                  <span className="font-mono text-xs font-bold text-amber-600">
                    {h.level === 2 ? `${i + 1}.` : "•"}
                  </span>
                  <button
                    type="button"
                    onClick={() => scrollToSection(h.id)}
                    className="text-left underline-offset-4 hover:underline"
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </nav>
      )}

      {/* Konten Artikel Utama */}
      <div
        id={contentId}
        className={cn(
          "prose-article min-h-[160px] transition-[font-size] duration-150",
          textSize === "lg" && "prose-size-lg",
          textSize === "xl" && "prose-size-xl",
        )}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
