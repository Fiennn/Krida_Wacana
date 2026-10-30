import Image from "next/image";
import Link from "next/link";
import { gradientForCategory } from "@/lib/category-style";
import { cn, formatCompactNumber, formatDate } from "@/lib/utils";
import type { ArticleCardData } from "@/lib/queries";

/**
 * Kartu artikel yang dipakai di beranda, kategori, tag, pencarian, profil.
 * Semua bagian adalah Server Component (tanpa event handler).
 *   - Cover gambar (jika ada) atau gradien bawaan kategori.
 *   - Badge kategori kuning di pojok kiri atas cover.
 *   - Judul serif, ringkasan 2 baris, meta penulis/tanggal, jumlah suka.
 */
export default function ArticleCard({
  article,
  className,
}: {
  article: ArticleCardData;
  className?: string;
}) {
  const gradient = gradientForCategory(article.category.name);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Cover (tautan) */}
      <Link
        href={`/artikel/${article.slug}`}
        className="relative block h-40 w-full overflow-hidden sm:h-44"
        aria-label={article.title}
      >
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden
            className={cn(
              "block h-full w-full bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
              gradient,
            )}
          />
        )}
        {/* Overlay gradien bawah cover */}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-navy-dark/50 via-transparent to-transparent"
        />
        <span className="absolute left-3 top-3 rounded-full bg-amber-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy-dark shadow-sm">
          {article.category.name}
        </span>
      </Link>

      {/* Konten */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-base font-bold leading-snug text-ink">
          <Link
            href={`/artikel/${article.slug}`}
            className="line-clamp-2 transition-colors hover:text-navy-royal"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-ink-secondary">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-xs text-ink-secondary">
          <Link
            href={`/penulis/${article.author.username}`}
            className="truncate font-semibold text-ink transition-colors hover:text-navy-royal"
          >
            {article.author.name}
          </Link>
          <span aria-hidden>&middot;</span>
          <span className="shrink-0 whitespace-nowrap">{formatDate(article.publishedAt)}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1 font-medium text-ink" aria-label={`${article.likesCount} suka`}>
            <svg className="h-3.5 w-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {formatCompactNumber(article.likesCount)}
          </span>
        </div>
      </div>
    </article>
  );
}
