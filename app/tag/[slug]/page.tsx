import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTagBySlug, listArticles } from "@/lib/queries";
import ArticleCard from "@/components/article/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hal?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Tag tidak ditemukan" };
  return { title: `Tag #${tag.name}` };
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const hal = Math.max(1, Number(sp.hal) || 1);

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const daftar = await listArticles({ tagSlug: tag.slug, page: hal, perPage: 9 });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header>
        <SectionHeader
          kicker="Tag"
          title={`#${tag.name}`}
          meta={[{ nama: "Artikel terkait", nilai: daftar.total }]}
        />
      </header>

      {daftar.items.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {daftar.items.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-line bg-white p-10 text-center text-sm text-ink-secondary shadow-card">
          Belum ada artikel dengan tag ini.
        </p>
      )}

      <Pagination
        page={daftar.page}
        totalPages={daftar.totalPages}
        buildHref={(n) =>
          n > 1 ? `/tag/${tag.slug}?hal=${n}` : `/tag/${tag.slug}`
        }
      />
    </section>
  );
}
