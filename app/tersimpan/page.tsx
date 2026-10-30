import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/article/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ArticleCardData } from "@/lib/queries";

export const metadata = {
  title: "Tersimpan",
};

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ hal?: string }> };

type BookmarkRow = {
  id: string;
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string | null;
    views: number;
    readMinutes: number;
    publishedAt: Date | null;
    category: { name: string; slug: string };
    author: { name: string | null; username: string; image: string | null };
    _count: { likes: number };
  };
};

function toCard(b: BookmarkRow): ArticleCardData {
  const a = b.article;
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    category: a.category,
    author: { name: a.author.name ?? "Anonim", username: a.author.username, image: a.author.image },
    publishedAt: a.publishedAt,
    views: a.views,
    readMinutes: a.readMinutes,
    likesCount: a._count.likes,
  };
}

/**
 * /tersimpan — daftar artikel yang disimpan (bookmark) oleh user.
 */
export default async function TersimpanPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk?next=/tersimpan");

  const sp = await searchParams;
  const hal = Math.max(1, Number(sp.hal) || 1);
  const perPage = 9;

  const where = { userId: session.user.id };

  const [rows, total] = await Promise.all([
    prisma.bookmark.findMany({
      where,
      include: {
        article: {
          include: {
            category: true,
            author: { select: { name: true, username: true, image: true } },
            _count: { select: { likes: true } },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      skip: (hal - 1) * perPage,
      take: perPage,
    }),
    prisma.bookmark.count({ where }),
  ]);

  const cards = rows.map(toCard);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <SectionHeader
          kicker="Koleksi Pembaca"
          title="Artikel Tersimpan"
          meta={[{ nama: "Total tersimpan", nilai: total }]}
        />
        <p className="mt-3 max-w-2xl text-sm text-ink-secondary">
          Semua artikel yang kamu simpan. Tekan tombol simpan (buku) di halaman artikel untuk menambah atau menghapusnya.
        </p>
      </header>

      {cards.length > 0 ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <Pagination
            page={hal}
            totalPages={totalPages}
            buildHref={(n) => (n > 1 ? `/tersimpan?hal=${n}` : "/tersimpan")}
          />
        </>
      ) : (
        <div className="rounded-3xl bg-white p-12 text-center shadow-card">
          <p className="font-serif text-xl font-bold text-ink">Belum ada artikel yang disimpan</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
            Tekan tombol bookmark di halaman artikel untuk menyimpannya. Artikel tersimpan akan muncul di sini.
          </p>
        </div>
      )}
    </section>
  );
}
