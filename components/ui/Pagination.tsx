import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Paginasi sederhana (query-param ?page=).
 * Halaman aktif = navy; lainnya putih.
 */
export default function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  /** Fungsi kecil untuk membentuk URL tiap nomor halaman (mis. mempertahankan ?q=&kategori=) */
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const angka = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) =>
      n === 1 ||
      n === totalPages ||
      Math.abs(n - page) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Navigasi halaman">
      {/* Sebelumnya */}
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="inline-flex h-9 items-center rounded-full border border-line bg-white px-4 text-sm font-medium text-ink transition-colors hover:border-navy-royal hover:text-navy-royal"
        >
          &larr; Sebelumnya
        </Link>
      ) : null}

      {angka.map((n, i) => (
        <span key={n} className="flex items-center">
          {/* Elipsis */}
          {i > 0 && n - angka[i - 1] > 1 && (
            <span className="px-1 text-ink-secondary" aria-hidden>
              …
            </span>
          )}
          <Link
            href={buildHref(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors",
              n === page
                ? "bg-navy text-white"
                : "border border-line bg-white text-ink hover:border-navy-royal hover:text-navy-royal",
            )}
          >
            {n}
          </Link>
        </span>
      ))}

      {/* Selanjutnya */}
      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className="inline-flex h-9 items-center rounded-full border border-line bg-white px-4 text-sm font-medium text-ink transition-colors hover:border-navy-royal hover:text-navy-royal"
        >
          Selanjutnya &rarr;
        </Link>
      ) : null}
    </nav>
  );
}
