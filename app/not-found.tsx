import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-surface-muted px-4 py-20">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-card">
        <p className="font-serif text-7xl font-bold text-navy">404</p>
        <h1 className="mt-4 font-serif text-2xl font-bold text-ink">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Halaman atau artikel yang kamu cari tidak tersedia, mungkin sudah
          dihapus atau alamatnya salah ketik.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-amber-brand px-6 text-sm font-bold text-navy-dark transition-all hover:bg-amber-highlight active:scale-95"
          >
            Ke Beranda
          </Link>
          <Link
            href="/cari"
            className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-navy-royal hover:text-navy-royal"
          >
            Cari Artikel
          </Link>
        </div>
      </div>
    </div>
  );
}
