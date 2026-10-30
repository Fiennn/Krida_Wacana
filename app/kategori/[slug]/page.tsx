import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCategoryBySlug,
  listArticles,
} from "@/lib/queries";
import { formatCompactNumber } from "@/lib/utils";
import ArticleCard from "@/components/article/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hal?: string; urutan?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const kategori = await getCategoryBySlug(slug);
  if (!kategori) return { title: "Kategori tidak ditemukan" };
  return {
    title: `Kategori ${kategori.name}`,
    description: kategori.description ?? undefined,
  };
}

export default async function KategoriPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const hal = Math.max(1, Number(sp.hal) || 1);
  const urutan = sp.urutan === "populer" ? "populer" : "terbaru";

  const kategori = await getCategoryBySlug(slug);
  if (!kategori) notFound();

  const daftar = await listArticles({
    kategoriSlug: kategori.slug,
    page: hal,
    perPage: 9,
    urutan,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header>
        <SectionHeader
          kicker="Kategori"
          title={kategori.name}
          description={kategori.description}
          meta={[{ nama: "Artikel terbit", nilai: daftar.total }]}
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
          Belum ada artikel yang terbit di kategori ini.
        </p>
      )}

      <Pagination
        page={daftar.page}
        totalPages={daftar.totalPages}
        buildHref={(n) => {
          const qs = new URLSearchParams();
          if (n > 1) qs.set("hal", String(n));
          if (urutan !== "terbaru") qs.set("urutan", urutan);
          const s = qs.toString();
          return s ? `/kategori/${kategori.slug}?${s}` : `/kategori/${kategori.slug}`;
        }}
      />
    </section>
  );
}
