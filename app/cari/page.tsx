import type { Metadata } from "next";
import Link from "next/link";
import { listArticles } from "@/lib/queries";
import ArticleCard from "@/components/article/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pencarian",
  description: "Cari artikel berdasarkan judul, isi, penulis, atau tag.",
};

type PageProps = {
  searchParams: Promise<{ q?: string; hal?: string; urutan?: string }>;
};

export default async function CariPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const hal = Math.max(1, Number(sp.hal) || 1);
  const urutan = sp.urutan === "populer" ? "populer" : "terbaru";

  const hasil = q
    ? await listArticles({ q, page: hal, perPage: 9, urutan })
    : { items: [], total: 0, page: 1, totalPages: 1 };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <SectionHeader
          kicker="Cari di Krida Wacana"
          title={q ? `Hasil untuk “${q}”` : "Pencarian Artikel"}
          meta={
            q
              ? [
                  { nama: "Ketemu", nilai: hasil.total },
                  { nama: "Halaman", nilai: hasil.totalPages },
                ]
              : undefined
          }
        />
      </header>

      {/* Search bar */}
      <form
        action="/cari"
        method="get"
        className="mb-10 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-card sm:flex-row sm:items-center sm:p-6"
      >
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m21 21-4-4" />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Judul, isi artikel, nama penulis, atau tag…"
            className="h-11 w-full rounded-full border border-line bg-surface-muted pl-11 pr-4 text-sm text-ink outline-none transition-all placeholder:text-ink-secondary focus:border-navy-royal focus:bg-white focus:ring-2 focus:ring-navy-royal/20"
            aria-label="Kata kunci pencarian"
          />
        </div>
        <select
          name="urutan"
          defaultValue={urutan}
          className="h-11 rounded-full border border-line bg-surface-muted px-4 text-sm font-medium text-ink outline-none focus:border-navy-royal"
          aria-label="Urutkan hasil"
        >
          <option value="terbaru">Terbaru</option>
          <option value="populer">Paling Dibaca</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-royal"
        >
          Cari
        </button>
      </form>

      {/* Hasil */}
      {q ? (
        hasil.items.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {hasil.items.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
            <Pagination
              page={hasil.page}
              totalPages={hasil.totalPages}
              buildHref={(n) => {
                const qs = new URLSearchParams();
                qs.set("q", q);
                if (n > 1) qs.set("hal", String(n));
                if (urutan !== "terbaru") qs.set("urutan", urutan);
                return `/cari?${qs.toString()}`;
              }}
            />
          </>
        ) : (
          <div className="rounded-3xl bg-white p-12 text-center shadow-card">
            <p className="font-serif text-xl font-bold text-ink">
              Tidak ada hasil untuk “{q}”
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
              Coba kata kunci yang lebih singkat, atau jelajahi kategori di
              beranda.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-amber-brand px-6 text-sm font-bold text-navy-dark transition-all hover:bg-amber-highlight"
            >
              Ke Beranda
            </Link>
          </div>
        )
      ) : (
        <p className="rounded-3xl bg-white p-10 text-center text-sm text-ink-secondary shadow-card">
          Ketik kata kunci di atas — bisa judul, potongan isi artikel, nama
          penulis, atau nama tag (mis. <span className="font-semibold text-ink">#kuliner</span>).
        </p>
      )}
    </section>
  );
}
