import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import {
  setStatusKomentarAction,
  hapusKomentarAdminAction,
} from "@/app/admin/actions";

export const metadata = { title: "Moderasi Komentar" };

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string }> };

/** /admin/komentar — moderasi komentar: sembunyikan atau hapus. */
export default async function AdminKomentarPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter =
    sp.status === "TAMPIL" || sp.status === "SEMBUNYI" ? sp.status : "SEMUA";

  const komentar = await prisma.comment.findMany({
    where:
      filter === "SEMUA"
        ? {}
        : filter === "TAMPIL"
          ? { hidden: false }
          : { hidden: true },
    include: {
      user: { select: { name: true, username: true } },
      article: { select: { title: true, slug: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });

  const tabs = [
    { label: "Semua", value: "SEMUA" },
    { label: "Tampil", value: "TAMPIL" },
    { label: "Disembunyikan", value: "SEMBUNYI" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">Moderasi Komentar</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Sembunyikan komentar yang tidak pantas, atau hapus permanen.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-ink-secondary shadow-card">
          {komentar.length} komentar
        </span>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filter komentar">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value === "SEMUA" ? "/admin/komentar" : `/admin/komentar?status=${t.value}`}
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
        {komentar.length === 0 && (
          <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-secondary shadow-card">
            Tidak ada komentar pada filter ini.
          </p>
        )}

        {komentar.map((c) => (
          <article
            key={c.id}
            className={cn(
              "rounded-2xl border bg-white p-4 shadow-card sm:p-5",
              c.hidden ? "border-rose-200" : "border-line",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-secondary">
                  <span className="font-bold text-ink">
                    {c.user.name ?? c.user.username}
                  </span>
                  <span>@{c.user.username}</span>
                  <span aria-hidden>&middot;</span>
                  <span>{formatDate(c.createdAt)}</span>
                  {c.hidden && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                      Disembunyikan
                    </span>
                  )}
                  {c.parentId && (
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">
                      Balasan
                    </span>
                  )}
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {c.content}
                </p>

                <p className="mt-2 truncate text-xs text-ink-secondary">
                  pada{" "}
                  <Link
                    href={`/artikel/${c.article.slug}#komentar`}
                    className="font-semibold text-navy-royal hover:underline"
                  >
                    {c.article.title}
                  </Link>
                  {c._count.replies > 0 && ` · ${c._count.replies} balasan`}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <form action={setStatusKomentarAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="sembunyi" value={c.hidden ? "0" : "1"} />
                  <button
                    type="submit"
                    className={cn(
                      "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition-colors",
                      c.hidden
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-line bg-white text-ink hover:border-amber-300 hover:text-amber-700",
                    )}
                  >
                    {c.hidden ? "Tampilkan" : "Sembunyikan"}
                  </button>
                </form>

                <form action={hapusKomentarAdminAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmit
                    label="Hapus"
                    variant="danger"
                    confirm={
                      c._count.replies > 0
                        ? "Hapus komentar ini beserta balasannya?"
                        : "Hapus komentar ini secara permanen?"
                    }
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
