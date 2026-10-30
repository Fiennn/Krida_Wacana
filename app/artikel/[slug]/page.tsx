import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import ShareButton from "@/components/article/ShareButton";
import FollowButton from "@/components/penulis/FollowButton";
import CommentSection from "@/components/comment/CommentSection";
import ReadingProgressBar from "@/components/article/ReadingProgressBar";
import ArticleContent from "@/components/article/ArticleContent";

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
  const decoded = decodeURIComponent(slug).trim();
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Bila URL slug mengandung spasi atau berbeda dari slug kanonikal, redirect ke URL yang bersih
  if (decoded !== article.slug && article.slug && !decoded.endsWith(article.slug)) {
    redirect(`/artikel/${encodeURIComponent(article.slug)}`);
  }

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
      {/* Indikator progres membaca fixed di atas layar */}
      <ReadingProgressBar />

      {/* ================= HERO HEADER ARTIKEL ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071638] via-[#0b2466] to-[#081a44] pb-28 pt-10 sm:pb-32 sm:pt-14 text-white">
        {/* Glow ambient background */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-blue-500/15 blur-[120px]"
        />

        {/* Watermark brand */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-16 select-none font-serif text-[13rem] font-bold text-white/[0.03]"
        >
          KW
        </span>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 z-10">
          {/* Breadcrumb yang rapi & ramah mobile */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/75">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Beranda</span>
            </Link>
            <span aria-hidden className="text-white/40">/</span>
            <Link
              href={`/kategori/${article.category.slug}`}
              className="rounded-full bg-white/10 px-3 py-1 font-medium backdrop-blur-md transition-colors hover:bg-white/20 hover:text-amber-brand"
            >
              {article.category.name}
            </Link>
            <span aria-hidden className="text-white/40">/</span>
            <span className="max-w-[220px] truncate text-white/50 sm:max-w-md">
              {article.title}
            </span>
          </nav>

          {/* Kategori Badge */}
          <div>
            <Link
              href={`/kategori/${article.category.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-navy-dark shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <span className="h-2 w-2 rounded-full bg-navy-dark animate-pulse" />
              {article.category.name}
            </Link>
          </div>

          {/* Judul Artikel */}
          <h1 className="mt-5 font-serif text-3xl font-bold leading-[1.25] text-white sm:text-4xl lg:text-5xl text-balance">
            {article.title}
          </h1>

          {/* Meta Penulis & Publikasi */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md sm:p-4 shadow-lg">
            <Link
              href={`/penulis/${article.author.username}`}
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              {article.author.image ? (
                <Image
                  src={article.author.image}
                  alt={article.author.name}
                  width={46}
                  height={46}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-amber-brand shadow-sm"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-brand font-serif text-lg font-bold text-navy-dark ring-2 ring-white/30 shadow-sm">
                  {article.author.name.slice(0, 1)}
                </span>
              )}
              <div>
                <p className="font-semibold text-white leading-tight">{article.author.name}</p>
                <p className="text-xs text-white/70">@{article.author.username}</p>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 sm:text-sm">
              <span className="flex items-center gap-1.5" title="Tanggal Terbit">
                <svg className="h-4 w-4 text-amber-brand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(article.publishedAt)}
              </span>

              <span className="flex items-center gap-1.5" title="Waktu Membaca">
                <svg className="h-4 w-4 text-amber-brand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
                {article.readMinutes} menit baca
              </span>

              <span className="flex items-center gap-1.5" title="Jumlah Pembaca">
                <svg className="h-4 w-4 text-amber-brand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {jumlahDibaca} dibaca
              </span>
            </div>
          </div>
        </div>

        {/* Transisi gradasi halus ke latar belakang halaman agar tidak terpotong kaku */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent via-[#071638]/40 to-surface-muted"
        />
      </section>

      {/* ================= KONTEN UTAMA ARTIKEL ================= */}
      <div className="bg-surface-muted pb-24">
        <article className="relative z-10 mx-auto -mt-16 sm:-mt-20 max-w-4xl px-4 sm:px-6">
          {/* Cover Gambar (Jika ada) */}
          {article.coverImage && (
            <figure className="mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl">
              <Image
                src={article.coverImage}
                alt={article.title}
                width={1200}
                height={675}
                className="max-h-[480px] w-full object-cover"
                priority
              />
            </figure>
          )}

          {/* Kartu Lembar Membaca (White Reading Sheet) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-10 lg:p-12">
            {/* Pita Aksen Atas (terutama saat tanpa cover) */}
            {!article.coverImage && (
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-brand to-navy-royal"
              />
            )}

            {/* Toolbar Aksi Atas */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
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
                <ShareButton title={article.title} />
              </div>

              <a
                href="#komentar"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-ink-secondary ring-1 ring-slate-200/60 transition-colors hover:bg-slate-100 hover:text-navy-royal sm:text-sm"
              >
                <svg className="h-4 w-4 text-ink-secondary/70" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{formatCompactNumber(totalKomentar)} komentar</span>
              </a>
            </div>

            {/* Kotak Ringkasan / Excerpt */}
            {article.excerpt && article.excerpt.trim() && (
              <div className="mb-8 rounded-2xl border-l-4 border-amber-brand bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-transparent p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-brand text-[10px] font-black text-navy-dark">
                    ★
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Ringkasan Artikel
                  </p>
                </div>
                <p className="mt-2 font-serif text-base italic leading-relaxed text-slate-800 sm:text-lg">
                  &ldquo;{article.excerpt}&rdquo;
                </p>
              </div>
            )}

            {/* Isi Teks Artikel Interaktif (dengan Table of Contents & Font Size Control) */}
            <ArticleContent htmlContent={kontenBersih} />

            {/* Tag Artikel */}
            {article.tags.length > 0 && (
              <div className="mt-10 border-t border-slate-100 pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
                    Topik / Tagar:
                  </span>
                  {article.tags.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tag/${t.slug}`}
                      className="rounded-full border border-slate-200 bg-surface-muted px-3.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-navy-royal hover:bg-white hover:text-navy-royal"
                    >
                      #{t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Bar Aksi Bawah */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2">
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
                <ShareButton title={article.title} />
              </div>

              <a
                href="#komentar"
                className="inline-flex h-9 items-center justify-center rounded-full bg-navy px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-navy-royal hover:shadow sm:text-sm"
              >
                Tulis Komentar
              </a>
            </div>
          </div>

          {/* Kartu Profil Penulis */}
          <aside className="mt-8 flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:flex-row sm:items-center sm:p-8">
            {article.author.image ? (
              <Image
                src={article.author.image}
                alt={article.author.name}
                width={72}
                height={72}
                className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-slate-200 shadow-sm"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-2xl font-bold text-amber-brand ring-2 ring-slate-200 shadow-sm">
                {article.author.name.slice(0, 1)}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Penulis Krida Wacana
                </span>
              </div>
              <Link
                href={`/penulis/${article.author.username}`}
                className="mt-1.5 block truncate font-serif text-xl font-bold text-ink transition-colors hover:text-navy-royal"
              >
                {article.author.name}
              </Link>
              <p className="text-xs text-ink-secondary">@{article.author.username}</p>
              {article.author.bio && (
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  {article.author.bio}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <FollowButton
                username={article.author.username}
                initialFollowing={following}
                initialFollowers={followers}
                isLoggedIn={!!userId}
                isOwn={!!userId && userId === article.author.id}
              />
              <Link
                href={`/penulis/${article.author.username}`}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-ink transition-colors hover:border-navy-royal hover:text-navy-royal hover:shadow-sm"
              >
                Lihat Profil
              </Link>
            </div>
          </aside>

          {/* Kolom Komentar */}
          <section id="komentar" className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-8">
            <CommentSection
              articleId={article.id}
              comments={comments}
              currentUserId={userId}
              currentAvatar={session?.user?.image ?? null}
              total={totalKomentar}
            />
          </section>
        </article>

        {/* Artikel Terkait */}
        {terkait.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Rekomendasi</span>
                <h2 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                  Artikel Terkait di <span className="text-navy-royal">{article.category.name}</span>
                </h2>
              </div>
              <Link
                href={`/kategori/${article.category.slug}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-navy-royal hover:underline sm:text-sm"
              >
                <span>Lihat Semua</span>
                <span>→</span>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {terkait.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
