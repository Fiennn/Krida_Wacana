import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleEditor, { type InitialArtikel } from "@/components/editor/ArticleEditor";

export const metadata = {
  title: "Edit Artikel",
};

type PageProps = { params: Promise<{ id: string }> };

/**
 * /tulis/[id] — Editor lanjutan untuk artikel milik sendiri.
 * Proteksi: hanya pemilik (atau admin) yang dapat membuka.
 */
export default async function TulisEditPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/masuk?next=/tulis/${id}`);
  // Menulis hanya untuk guru/siswa yang disetujui admin
  if (session.user.role !== "ADMIN" && session.user.role !== "PENULIS") {
    redirect("/dashboard?izin=menulis");
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      images: { orderBy: [{ createdAt: "asc" }] },
      category: true,
    },
  });
  if (!article) notFound();

  const isOwner = article.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) redirect("/dashboard?forbidden=1");

  const initial: InitialArtikel = {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    coverImage: article.coverImage,
    categorySlug: article.category.slug,
    tags: article.tags.map((t) => t.tag.name),
    galleryUrls: article.images.map((i) => i.url),
    status: article.status as "DRAFT" | "PUBLISHED",
  };

  const kategoriList = await prisma.category.findMany({
    orderBy: [{ name: "asc" }],
    select: { name: true, slug: true },
  });

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-brand">
            Editor
          </p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-ink sm:text-3xl">
            Lanjut Menulis:{" "}
            <span className="text-amber-brand">Edit Artikel</span>
          </h1>
        </div>
        {article.status === "PUBLISHED" && article.slug && (
          <a
            href={`/artikel/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy-royal transition-colors hover:border-navy-royal"
          >
            Lihat versi terbit ↗
          </a>
        )}
      </header>

      <ArticleEditor kategoriList={kategoriList} initial={initial} />
    </section>
  );
}
