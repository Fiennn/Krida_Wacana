import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCompactNumber, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import DeleteArticleButton from "@/components/dashboard/DeleteArticleButton";

export const metadata = {
  title: "Tulisan Saya",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string; tersimpan?: string; forbidden?: string; izin?: string }>;
};

/**
 * Dashboard penulis "Tulisan Saya":
 * abstrak: tab draft/terbit, statistik views-like-komentar, aksi edit/hapus.
 */
export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/masuk?next=/dashboard");

  const sp = await searchParams;
  const filterStatus = sp.status === "DRAFT" || sp.status === "PUBLISHED" ? sp.status : "SEMUA";
  const isWriter =
    session?.user?.role === "ADMIN" || session?.user?.role === "PENULIS";

  const where = { authorId: userId, ...(filterStatus === "SEMUA" ? {} : { status: filterStatus }) };

  const [rows, totalViewsAgg, totalLikes, totalComments, draftsCount, publishedCount] =
    await Promise.all([
      prisma.article.findMany({
        where,
        include: { category: true, _count: { select: { likes: true, comments: true, bookmarks: true } } },
        orderBy: [{ updatedAt: "desc" }],
      }),
      prisma.article.aggregate({ where: { authorId: userId }, _sum: { views: true } }),
      prisma.like.count({ where: { article: { authorId: userId } } }),
      prisma.comment.count({ where: { article: { authorId: userId }, hidden: false } }),
      prisma.article.count({ where: { authorId: userId, status: "DRAFT" } }),
      prisma.article.count({ where: { authorId: userId, status: "PUBLISHED" } }),
    ]);

  const totalViews = totalViewsAgg._sum.views ?? 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-brand">
            Dashboard Penulis
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-ink sm:text-4xl">
            Tulisan <span className="text-amber-brand">Saya</span>
          </h1>
        </div>
        {isWriter ? (
          <Link
            href="/tulis"
            className="inline-flex h-11 items-center justify-center rounded-full bg-amber-brand px-6 text-sm font-bold text-navy-dark transition-all hover:bg-amber-highlight active:scale-95"
          >
            + Tulis Artikel Baru
          </Link>
        ) : (
          <span className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-white px-6 text-sm font-semibold text-ink-secondary">
            Status akun: Pembaca
          </span>
        )}
      </header>

      {!isWriter && (
        <div
          role="status"
          className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900"
        >
          <p className="font-semibold">Akunmu berstatus pembaca.</p>
          <p className="mt-1 text-amber-800">
            Kamu tetap bisa membaca, menyukai, menyimpan, dan berkomentar. Untuk
            menulis artikel, minta admin sekolah mengubah peran akunmu menjadi
            penulis.
          </p>
        </div>
      )}

      {sp.tersimpan && (
        <div
          role="status"
          className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-medium text-emerald-800"
        >
          Perubahan berhasil disimpan.
        </div>
      )}
      {sp.forbidden && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-medium text-rose-700"
        >
          Kamu tidak punya izin membuka halaman tersebut.
        </div>
      )}

      {/* Statistika ringkas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Pembaca", value: formatCompactNumber(totalViews) },
          { label: "Total Suka", value: formatCompactNumber(totalLikes) },
          { label: "Komentar", value: formatCompactNumber(totalComments) },
          { label: "Draf / Terbit", value: `${draftsCount} / ${publishedCount}` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white px-4 py-4 shadow-card">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-secondary">
              {s.label}
            </dt>
            <dd className="mt-1 font-serif text-2xl font-bold text-navy">{s.value}</dd>
          </div>
        ))}
      </div>

      {/* Tab status */}
      <nav className="mt-8 flex flex-wrap items-center gap-2" aria-label="Filter status tulisan">
        {(
          [
            { label: "Semua", value: "SEMUA" },
            { label: "Draf", value: "DRAFT" },
            { label: "Terbit", value: "PUBLISHED" },
          ]
        ).map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard?status=${tab.value}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              filterStatus === tab.value
                ? "bg-navy text-white"
                : "border border-line bg-white text-ink-secondary hover:border-navy-royal hover:text-navy-royal",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Daftar tulisan */}
      <div className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-card">
            <p className="font-serif text-lg font-bold text-ink">Belum ada tulisan di sini.</p>
            <p className="mt-2 text-sm text-ink-secondary">
              {!isWriter
                ? "Tulisan akan muncul di sini setelah akunmu diberi izin menulis oleh admin sekolah."
                : filterStatus === "DRAFT"
                  ? "Simpan tulisanmu sebagai draf dulu jika belum mantap diterbitkan."
                  : "Mulai bagikan kegiatan dan prestasi sekolah untuk dibaca semua orang."}
            </p>
            {isWriter && (
              <Link
                href="/tulis"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-royal"
              >
                Tulis Sekarang
              </Link>
            )}
          </div>
        ) : (
          rows.map((a) => (
            <article
              key={a.id}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-card sm:flex-row sm:items-center"
            >
              {/* Cover mini */}
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-32">
                {a.coverImage ? (
                  <Image src={a.coverImage} alt={a.title} fill sizes="128px" className="object-cover" />
                ) : (
                  <span className="block h-full w-full bg-gradient-to-br from-navy-royal to-navy-dark" aria-hidden />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      a.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {a.status === "PUBLISHED" ? "Terbit" : "Draf"}
                  </span>
                  <span className="text-[11px] text-ink-secondary">
                    {a.category.name} &middot;{" "}
                    {a.status === "PUBLISHED" && a.publishedAt
                      ? `diterbitkan ${formatDate(a.publishedAt)}`
                      : `diubah ${formatDate(a.updatedAt)}`}
                  </span>
                </div>
                <h2 className="mt-1 truncate font-serif text-base font-bold text-ink">
                  <Link
                    href={a.status === "PUBLISHED" ? `/artikel/${a.slug}` : `/tulis/${a.id}`}
                    className="hover:text-navy-royal"
                  >
                    {a.title}
                  </Link>
                </h2>
                <p className="mt-1 text-xs text-ink-secondary">
                  {formatCompactNumber(a.views)} dibaca &middot;{" "}
                  {formatCompactNumber(a._count.likes)} suka &middot;{" "}
                  {formatCompactNumber(a._count.comments)} komentar
                  {a._count.bookmarks > 0 && <> &middot; {formatCompactNumber(a._count.bookmarks)} disimpan</>}
                </p>
              </div>

              {/* Aksi */}
              <div className="flex shrink-0 items-center gap-2">
                {a.status === "PUBLISHED" && (
                  <Link
                    href={`/artikel/${a.slug}`}
                    className="inline-flex h-9 items-center rounded-full border border-line bg-white px-4 text-xs font-semibold text-ink transition-colors hover:border-navy-royal hover:text-navy-royal"
                  >
                    Lihat
                  </Link>
                )}
                <Link
                  href={`/tulis/${a.id}`}
                  className="inline-flex h-9 items-center rounded-full border border-line bg-white px-4 text-xs font-semibold text-ink transition-colors hover:border-navy-royal hover:text-navy-royal"
                >
                  Edit
                </Link>
                <DeleteArticleButton articleId={a.id} title={a.title} />
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
