import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthorByUsername } from "@/lib/queries";
import { formatCompactNumber, formatDate } from "@/lib/utils";
import ArticleCard from "@/components/article/ArticleCard";
import Pagination from "@/components/ui/Pagination";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ hal?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profil = await getAuthorByUsername(username);
  if (!profil) return { title: "Penulis tidak ditemukan" };
  return {
    title: `${profil.author.name} (@${profil.author.username})`,
    description:
      profil.author.bio ??
      `Profil dan seluruh tulisan ${profil.author.name} di Krida Wacana.`,
  };
}

export default async function ProfilPenulisPage({ params, searchParams }: PageProps) {
  const [{ username }, sp] = await Promise.all([params, searchParams]);
  const hal = Math.max(1, Number(sp.hal) || 1);

  const profil = await getAuthorByUsername(username, hal, 8);
  if (!profil) notFound();

  const { author, stats, articles, totalPages, page } = profil;

  return (
    <>
      {/* ---------- Kepala profil (navy) ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-royal to-navy-dark pb-24 pt-12 text-white">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 select-none font-serif text-[10rem] font-bold text-white/5"
        >
          KW
        </span>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            {author.image ? (
              <Image
                src={author.image}
                alt={author.name}
                width={112}
                height={112}
                className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-amber-brand/40"
              />
            ) : (
              <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-amber-brand font-serif text-4xl font-bold text-navy-dark ring-4 ring-amber-highlight/30">
                {author.name.slice(0, 1).toUpperCase()}
              </span>
            )}

            <div className="min-w-0 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-brand">
                Profil Penulis
              </p>
              <h1 className="mt-1.5 truncate font-serif text-3xl font-bold sm:text-4xl">
                {author.name}
              </h1>
              <p className="mt-1 text-sm text-white/60">
                @{author.username} &middot; Bergabung {formatDate(author.joinedAt)}
              </p>
              {author.bio && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
                  {author.bio}
                </p>
              )}
            </div>
          </div>

          {/* Kartu statistik glass */}
          <dl className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: "Artikel", nilai: stats.articles },
              { label: "Pembaca", nilai: stats.views },
              { label: "Suka", nilai: stats.likes },
              { label: "Pengikut", nilai: stats.followers },
              { label: "Diikuti", nilai: stats.following },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl px-4 py-3 shadow-glass">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-white/60">
                  {s.label}
                </dt>
                <dd className="mt-0.5 font-serif text-xl font-bold text-amber-brand">
                  {formatCompactNumber(s.nilai)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Daftar tulisan ---------- */}
      <section className="mx-auto -mt-12 max-w-7xl px-4 pb-14 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
          <h2 className="font-serif text-xl font-bold text-ink">
            Tulisan <span className="text-amber-brand">Terbit</span>
            <span className="ml-2 align-middle text-sm font-sans font-medium text-ink-secondary">
              ({formatCompactNumber(stats.articles)})
            </span>
          </h2>

          {articles.length > 0 ? (
            <>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {articles.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={(n) =>
                  n > 1 ? `/penulis/${author.username}?hal=${n}` : `/penulis/${author.username}`
                }
              />
            </>
          ) : (
            <p className="mt-8 rounded-2xl border border-line bg-surface-muted p-10 text-center text-sm text-ink-secondary">
              Penulis ini belum mempublikasikan tulisan apa pun.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
