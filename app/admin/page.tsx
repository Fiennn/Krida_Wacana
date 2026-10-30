import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCompactNumber, formatDate } from "@/lib/utils";

export const metadata = { title: "Ringkasan Admin" };

export const dynamic = "force-dynamic";

/** Halaman ringkasan panel admin: statistik situs + aktivitas terbaru. */
export default async function AdminPage() {
  const [totalArtikel, totalTerbit, totalDraf, totalKomentar, totalKomentarSembunyi, totalPengguna, totalPengikut, aggViews, artikelTerbaru, komentarTerbaru] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.comment.count({ where: { hidden: false } }),
      prisma.comment.count({ where: { hidden: true } }),
      prisma.user.count(),
      prisma.follow.count(),
      prisma.article.aggregate({ where: { status: "PUBLISHED" }, _sum: { views: true } }),
      prisma.article.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { author: { select: { name: true } }, category: { select: { name: true, slug: true } } },
      }),
      prisma.comment.findMany({
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, username: true } }, article: { select: { title: true, slug: true } } },
      }),
    ]);

  const statCards = [
    { label: "Artikel", nilai: totalArtikel, sub: `${totalTerbit} terbit · ${totalDraf} draf` },
    { label: "Komentar", nilai: totalKomentar, sub: `${totalKomentarSembunyi} disembunyikan` },
    { label: "Pengguna", nilai: totalPengguna, sub: "seluruh penulis & pembaca" },
    { label: "Total Dibaca", nilai: aggViews._sum.views ?? 0, sub: `${totalPengikut} relasi ikuti` },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">Ringkasan Situs</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Pemantauan cepat untuk seluruh konten Krida Wacana.
        </p>
      </header>

      {/* Kartu statistik */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-secondary">{s.label}</p>
            <p className="mt-2 font-serif text-3xl font-bold text-navy">
              {formatCompactNumber(s.nilai)}
            </p>
            <p className="mt-1 text-xs text-ink-secondary">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Banner Akses Buku Tamu & Track Record */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-navy/20 bg-gradient-to-r from-navy to-navy-dark p-6 text-white shadow-card">
        <div className="space-y-1">
          <span className="inline-block rounded-md bg-amber-brand/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-brand">
            Fitur Resmi Evaluasi & Akreditasi
          </span>
          <h2 className="font-serif text-xl font-bold text-white">
            Buku Tamu & Track Record Pengunjung
          </h2>
          <p className="text-xs text-white/75 max-w-xl">
            Pantau statistik kunjungan, riwayat pembaca artikel, perincian perangkat & browser, serta unduh rekap Excel atau cetak laporan resmi A4.
          </p>
        </div>
        <Link
          href="/admin/track-record"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-brand px-5 py-2.5 text-xs font-bold text-navy-dark shadow-md transition-all hover:bg-amber-highlight active:scale-95"
        >
          <span>Buka Dashboard Rekap</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Aktivitas terbaru */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-serif text-lg font-bold text-ink">Artikel Terbaru</h2>
          <ul className="mt-3 divide-y divide-line">
            {artikelTerbaru.map((a) => (
              <li key={a.id} className="py-2.5 first:pt-0 last:pb-0">
                <Link href={`/artikel/${a.slug}`} className="group block">
                  <p className="truncate text-sm font-semibold text-ink group-hover:text-navy-royal">
                    {a.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-secondary">
                    {a.author.name} · {a.category.name} · {formatDate(a.createdAt)} ·{" "}
                    <span
                      className={
                        a.status === "PUBLISHED"
                          ? "font-semibold text-emerald-600"
                          : "font-semibold text-amber-600"
                      }
                    >
                      {a.status === "PUBLISHED" ? "Terbit" : "Draf"}
                    </span>
                  </p>
                </Link>
              </li>
            ))}
            {artikelTerbaru.length === 0 && (
              <li className="py-3 text-sm text-ink-secondary">Belum ada artikel.</li>
            )}
          </ul>
          <Link
            href="/admin/artikel"
            className="mt-4 inline-block text-sm font-semibold text-navy-royal hover:underline"
          >
            Kelola artikel →
          </Link>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-serif text-lg font-bold text-ink">Komentar Terbaru</h2>
          <ul className="mt-3 divide-y divide-line">
            {komentarTerbaru.map((c) => (
              <li key={c.id} className="py-2.5 first:pt-0 last:pb-0">
                <Link href={`/artikel/${c.article.slug}#komentar`} className="group block">
                  <p className="truncate text-sm text-ink">
                    <span className="font-semibold group-hover:text-navy-royal">
                      {c.user.name}
                    </span>{" "}
                    &middot; &ldquo;{c.content.slice(0, 60)}&rdquo;
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-secondary">
                    pada {c.article.title} · {formatDate(c.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
            {komentarTerbaru.length === 0 && (
              <li className="py-3 text-sm text-ink-secondary">Belum ada komentar.</li>
            )}
          </ul>
          <Link
            href="/admin/komentar"
            className="mt-4 inline-block text-sm font-semibold text-navy-royal hover:underline"
          >
            Moderasi komentar →
          </Link>
        </section>
      </div>
    </div>
  );
}
