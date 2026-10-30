import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getArticleBySlug,
  getRelatedArticles,
  incrementViews,
  getArticleComments,
  getFollowerCount,
  isFollowing,
} from "@/lib/queries";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeArticleHtml, htmlToText } from "@/lib/sanitize";
import { formatCompactNumber, formatDate } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import ArticleCard from "@/components/article/ArticleCard";
import LikeButton from "@/components/article/LikeButton";
import BookmarkButton from "@/components/article/BookmarkButton";
import FollowButton from "@/components/penulis/FollowButton";
import CommentSection from "@/components/comment/CommentSection";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

/** SEO meta dinamis per artikel */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return { title: "Artikel tidak ditemukan" };
  }

  const deskripsi = htmlToText(article.excerpt).slice(0, 160);

  return {
    title: article.title,
    description: deskripsi,
    keywords: article.tags.map((t) => t.name),
    alternates: { canonical: `/artikel/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: deskripsi,
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
      tags: article.tags.map((t) => t.name),
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: deskripsi,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Hitung pembaca setiap halaman dibuka
  await incrementViews(article.id);

  const [terkait, kontenBersih] = await Promise.all([
    getRelatedArticles(article.category.id, article.id, 3),
    Promise.resolve(sanitizeArticleHtml(article.content)),
  ]);

  const jumlahDibaca = formatCompactNumber(article.views);

  // ---------- Data interaksi untuk pembaca saat ini ----------
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isAdmin = session?.user?.role === "ADMIN";

  const [likedRow, bookmarkedRow, followers, following, comments] = await Promise.all([
    userId
      ? prisma.like.findUnique({
          where: { userId_articleId: { userId, articleId: article.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
    userId
      ? prisma.bookmark.findUnique({
          where: { userId_articleId: { userId, articleId: article.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
    getFollowerCount(article.author.id),
    isFollowing(userId, article.author.id),
    getArticleComments(article.id, userId, isAdmin),
  ]);

  const totalKomentar = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <>
      {/* ---------- Bagian atas navy dengan judul ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-royal to-navy-dark pb-28 pt-10 text-white">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 select-none font-serif text-[10rem] font-bold text-white/5"
        >
          KW
        </span>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="shrink-0 whitespace-nowrap transition-colors hover:text-amber-brand">Beranda</Link>
            <span aria-hidden className="shrink-0">/</span>
            <Link href={`/kategori/${article.category.slug}`} className="shrink-0 whitespace-nowrap transition-colors hover:text-amber-brand">
              {article.category.name}
            </Link>
            <span aria-hidden className="shrink-0">/</span>
            <span className="min-w-0 truncate text-white/40">{article.title}</span>
          </nav>

          {/* Badge kategori */}
          <Link
            href={`/kategori/${article.category.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-dark"
          >
            {article.category.name}
          </Link>

          {/* Judul */}
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          {/* Meta: penulis, tanggal, waktu baca, views */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-white/70">
            <Link
              href={`/penulis/${article.author.username}`}
              className="flex items-center gap-2.5 transition-colors hover:text-white"
            >
              {article.author.image ? (
                <Image
                  src={article.author.image}
                  alt={article.author.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-brand text-sm font-bold text-navy-dark">
                  {article.author.name.slice(0, 1)}
                </span>
              )}
              <span>
                <span className="block font-semibold text-white">{article.author.name}</span>
                <span className="block text-xs text-white/50">@{article.author.username}</span>
              </span>
            </Link>

            <span aria-hidden className="hidden h-4 w-px bg-white/20 sm:block" />
            <span>{formatDate(article.publishedAt)}</span>
            <span aria-hidden className="hidden h-4 w-px bg-white/20 sm:block" />
            <span>{article.readMinutes} menit baca</span>
            <span aria-hidden className="hidden h-4 w-px bg-white/20" />
            <span className="flex items-center gap-1.5" title="Jumlah dibaca">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {jumlahDibaca} dibaca
            </span>
          </div>
        </div>
      </section>

      {/* ---------- Konten ---------- */}
      <article className="relative z-10 mx-auto -mt-24 max-w-3xl px-4 sm:px-6">
        {/* Gambar cover */}
        {article.coverImage && (
          <figure className="overflow-hidden rounded-3xl shadow-card">
            <Image
              src={article.coverImage}
              alt={article.title}
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              priority
            />
          </figure>
        )}

        {/* Isi artikel (HTML sudah disanitasi) */}
        <div
          className="prose-article mt-10 text-[15px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: kontenBersih }}
        />

        {/* Tag */}
        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">Tag:</span>
            {article.tags.map((t) => (
              <Link
                key={t.slug}
                href={`/tag/${t.slug}`}
                className="rounded-full border border-line bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-navy-royal hover:bg-white hover:text-navy-royal"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Kartu penulis */}
        <aside className="mt-10 flex flex-col gap-5 rounded-2xl border border-line bg-white p-6 shadow-card sm:flex-row sm:items-center">
          {article.author.image ? (
            <Image
              src={article.author.image}
              alt={article.author.name}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-2xl font-bold text-amber-brand">
              {article.author.name.slice(0, 1)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Ditulis oleh
            </p>
            <Link
              href={`/penulis/${article.author.username}`}
              className="mt-0.5 block truncate font-serif text-lg font-bold text-ink transition-colors hover:text-navy-royal"
            >
              {article.author.name}
            </Link>
            {article.author.bio && (
              <p className="mt-1.5 line-clamp-2 text-sm text-ink-secondary">
                {article.author.bio}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <FollowButton
              username={article.author.username}
              initialFollowing={following}
              initialFollowers={followers}
              isLoggedIn={!!userId}
              isOwn={!!userId && userId === article.author.id}
            />
            <Link
              href={`/penulis/${article.author.username}`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink transition-colors hover:border-navy-royal hover:text-navy-royal"
            >
              Lihat Profil
            </Link>
          </div>
        </aside>

        {/* Interaksi: suka, simpan + ikuti penulis */}
        <aside className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-muted p-4">
          <LikeButton
            articleId={article.id}
            initialCount={article.likesCount}
            initialLiked={!!likedRow}
            isLoggedIn={!!userId}
          />
          <BookmarkButton
            articleId={article.id}
            initialBookmarked={!!bookmarkedRow}
            isLoggedIn={!!userId}
          />
          <span className="flex items-center gap-1.5 text-sm text-ink-secondary">
            <svg className="h-4 w-4 text-ink-secondary/60" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5v-1a7 7 0 0 1 14 0v1h-4M3 20h18" />
            </svg>
            {formatCompactNumber(totalKomentar)} komentar
          </span>
          <a
            href="#komentar"
            className="ml-auto text-sm font-semibold text-navy-royal underline-offset-2 hover:underline"
          >
            Tulis komentar ↓
          </a>
        </aside>

        {/* Diskusi / komentar */}
        <CommentSection
          articleId={article.id}
          comments={comments}
          currentUserId={userId}
          currentAvatar={session?.user?.image ?? null}
          total={totalKomentar}
        />
      </article>

      {/* ---------- Artikel terkait ---------- */}
      {terkait.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="mb-6 font-serif text-2xl font-bold text-ink">
            Artikel <span className="text-amber-brand">Terkait</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {terkait.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
