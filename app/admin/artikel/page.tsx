import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCompactNumber, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { setStatusArtikelAction, hapusArtikelAdminAction } from "@/app/admin/actions";

export const metadata = { title: "Kelola Artikel" };

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string }> };

/** /admin/artikel — moderasi & pengelolaan seluruh artikel. */
export default async function AdminArtikelPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter = sp.status === "PUBLISHED" || sp.status === "DRAFT" ? sp.status : "SEMUA";

  const artikel = await prisma.article.findMany({
    where: filter === "SEMUA" ? {} : { status: filter },
    include: {
      author: { select: { name: true, username: true } },
      category: { select: { name: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const tabs = [
    { label: "Semua", value: "SEMUA" },
    { label: "Terbit", value: "PUBLISHED" },
    { label: "Draf", value: "DRAFT" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">Kelola Artikel</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Terbitkan, tarik, atau hapus artikel warga sekolah.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-ink-secondary shadow-card">
          {artikel.length} artikel
        </span>
      </header>

      {/* Filter status */}
      <nav className="flex flex-wrap gap-2" aria-label="Filter status artikel">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value === "SEMUA" ? "/admin/artikel" : `/admin/artikel?status=${t.value}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              filter === t.value
                ? "bg-navy text-white"
                : "border border-line bg-white text-ink-secondary hover:border-navy-royal hover:text-navy-royal",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-3">
        {artikel.length === 0 && (
          <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-secondary shadow-card">
            Tidak ada artikel pada filter ini.
          </p>
        )}

        {artikel.map((a) => (
          <article
            key={a.id}
            className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
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
                    {a.category.name} &middot; {a.author.name ?? a.author.username} &middot;{" "}
                    {a.publishedAt ? formatDate(a.publishedAt) : `dibuat ${formatDate(a.createdAt)}`}
                  </span>
                </div>

                <h2 className="mt-1.5 font-serif text-lg font-bold text-ink">
                  {a.status === "PUBLISHED" ? (
                    <Link href={`/artikel/${a.slug}`} className="hover:text-navy-royal">
                      {a.title}
                    </Link>
                  ) : (
                    a.title
                  )}
                </h2>

                <p className="mt-1 text-xs text-ink-secondary">
                  {formatCompactNumber(a.views)} dibaca &middot;{" "}
                  {formatCompactNumber(a._count.likes)} suka &middot;{" "}
                  {formatCompactNumber(a._count.comments)} komentar
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <form action={setStatusArtikelAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="terbit" value={a.status === "PUBLISHED" ? "0" : "1"} />
                  <button
                    type="submit"
                    className={cn(
                      "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition-colors",
                      a.status === "PUBLISHED"
                        ? "border-line bg-white text-ink hover:border-amber-300 hover:text-amber-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                    )}
                  >
                    {a.status === "PUBLISHED" ? "Tarik ke Draf" : "Terbitkan"}
                  </button>
                </form>

                <form action={hapusArtikelAdminAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <ConfirmSubmit
                    label="Hapus"
                    variant="danger"
                    confirm={`Hapus artikel "${a.title}"? Komentar, suka, dan simpanan terkait ikut terhapus.`}
                  />
                </form>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
