import Image from "next/image";
import Link from "next/link";
import { LOGO_FILES, SCHOOL_NAME, SITE_TAGLINE } from "@/lib/constants";
import { cn, formatCompactNumber, formatDate } from "@/lib/utils";
import {
  getCategoriesWithCount,
  getPopularArticles,
  getSiteStats,
  listArticles,
} from "@/lib/queries";
import ArticleCard from "@/components/article/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import { gradientForCategory } from "@/lib/category-style";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ hal?: string; kategori?: string; urutan?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const hal = Math.max(1, Number(params.hal) || 1);
  const kategoriSlugAktif = params.kategori || undefined;
  const urutanAktif = params.urutan === "populer" ? "populer" : "terbaru";

  const [statistik, populer, kategoriList, daftar, session] = await Promise.all([
    getSiteStats(),
    getPopularArticles(5),
    getCategoriesWithCount(),
    listArticles({
      page: hal,
      perPage: 8,
      kategoriSlug: kategoriSlugAktif,
      urutan: urutanAktif,
    }),
    auth(),
  ]);

  const kategoriSudahDipilih = kategoriList.find((k) => k.slug === kategoriSlugAktif);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-royal to-navy-dark text-white">
        {/* Watermark logo sekolah samar */}
        <Image
          src={LOGO_FILES.sekolah}
          alt=""
          aria-hidden
          width={520}
          height={520}
          className="pointer-events-none absolute -right-16 -top-16 select-none opacity-5"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-amber-brand/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:pb-20 lg:pt-20">
          {/* Kolom kiri: badge, judul, statistik */}
          <div className="min-w-0 animate-fade-in-up space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-brand/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-brand ring-1 ring-amber-brand/30">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-brand" aria-hidden />
              Portal Artikel Sekolah
            </span>

            <h1 className="max-w-2xl font-serif text-4xl font-bold leading-[1.15] sm:text-5xl lg:text-6xl">
              Cerita Sekolah di Lereng Slamet,{" "}
              <span className="text-amber-brand">Dibaca Semua Orang</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Media publikasi {SCHOOL_NAME}, Kec. Baturraden, Kab. Banyumas.
              Menghimpun kabar kegiatan belajar, prestasi siswa, dan keseharian
              warga sekolah di kaki Gunung Slamet.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="#artikel-terbaru"
                className="inline-flex h-12 items-center justify-center rounded-full bg-amber-brand px-7 text-sm font-bold text-navy-dark transition-all hover:bg-amber-highlight hover:shadow-lg active:scale-95"
              >
                Jelajahi Artikel
              </Link>
              <Link
                href="/kategori/profil-sekolah"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/40 hover:bg-white/20"
              >
                Profil Sekolah
              </Link>
            </div>

            {/* Kartu statistik glassmorphism (data nyata) */}
            <dl className="grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { value: formatCompactNumber(statistik.totalArticles), label: "Artikel Terbit" },
                { value: String(statistik.totalCategories), label: "Kategori" },
                { value: formatCompactNumber(statistik.totalAuthors), label: "Penulis" },
                { value: formatCompactNumber(statistik.totalViews), label: "Total Dibaca" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl px-4 py-3.5 shadow-glass transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-white/60">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-bold text-amber-brand">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Kolom kanan: Artikel Terpopuler (glass card) */}
          <aside className="min-w-0 animate-fade-in-up h-fit self-center rounded-3xl border border-white/15 bg-white/10 p-5 shadow-glass backdrop-blur-lg lg:self-start">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
                <span aria-hidden className="text-amber-brand">★</span>
                Artikel Terpopuler
              </h2>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                Terbanyak Dibaca
              </span>
            </div>
            <ol className="space-y-1.5">
              {populer.map((a, i) => (
                <li key={a.id}>
                  <Link
                    href={`/artikel/${a.slug}`}
                    className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-white/10"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-serif text-sm font-bold",
                        i === 0
                          ? "bg-amber-brand text-navy-dark"
                          : "bg-white/10 text-white/60",
                      )}
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br",
                        gradientForCategory(a.category.name),
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white group-hover:text-amber-brand">
                        {a.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-white/50">
                        {a.author.name} &middot; {formatCompactNumber(a.views)} dibaca
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      {/* ================= DAFTAR ARTIKEL ================= */}
      <section id="artikel-terbaru" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 lg:py-16">
        <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
          {/* Search bar & urutan */}
          <form
            action="/cari"
            method="get"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m21 21-4-4" />
              </svg>
              <input
                type="search"
                name="q"
                placeholder="Cari artikel, penulis, atau tag…"
                className="h-11 w-full rounded-full border border-line bg-surface-muted pl-11 pr-4 text-sm text-ink outline-none transition-all placeholder:text-ink-secondary focus:border-navy-royal focus:bg-white focus:ring-2 focus:ring-navy-royal/20"
                aria-label="Cari artikel"
              />
            </div>
            <select
              name="urutan"
              className="h-11 rounded-full border border-line bg-surface-muted px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-navy-royal"
              aria-label="Urutkan artikel"
              defaultValue={urutanAktif}
            >
              <option value="terbaru">Terbaru</option>
              <option value="populer">Populer</option>
            </select>
            <input type="hidden" name="kategori" value={kategoriSlugAktif ?? ""} />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-royal"
            >
              Cari
            </button>
          </form>

          {/* Chip kategori (bisa digeser horizontal) */}
          <div className="scrollbar-hide mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <Link
              href={urutanHref(urutanAktif, undefined)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                !kategoriSlugAktif
                  ? "bg-navy text-white"
                  : "border border-line bg-white text-ink-secondary hover:border-navy-royal hover:text-navy-royal",
              )}
            >
              Semua
            </Link>
            {kategoriList.map((k) => (
              <Link
                key={k.slug}
                href={urutanHref(urutanAktif, k.slug)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  kategoriSlugAktif === k.slug
                    ? "bg-navy text-white"
                    : "border border-line bg-white text-ink-secondary hover:border-navy-royal hover:text-navy-royal",
                )}
              >
                {k.name}
              </Link>
            ))}
          </div>

          {/* Grid kartu artikel */}
          {daftar.items.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {daftar.items.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-ink-secondary">
              Belum ada artikel di kategori ini.
            </p>
          )}

          <div className="mt-6">
            <Pagination
              page={daftar.page}
              totalPages={daftar.totalPages}
              buildHref={(n) => urutanHref(urutanAktif, kategoriSlugAktif, n)}
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-12 text-center text-white sm:px-12">
          <Image
            src={LOGO_FILES.sekolah}
            alt=""
            aria-hidden
            width={360}
            height={360}
            className="pointer-events-none absolute -left-12 -top-14 select-none opacity-5"
          />
          {session?.user ? (
            session.user.role === "ADMIN" || session.user.role === "PENULIS" ? (
              <>
                <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                  Halo, <span className="text-amber-brand">{session.user.name || session.user.username}</span>! Siap berbagi kabar sekolah?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                  Kamu sudah masuk sebagai <strong>Penulis</strong>. Buat artikel baru mengenai kegiatan belajar, prestasi, atau karya siswa untuk dibaca seluruh warga sekolah.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/tulis"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-amber-brand px-7 text-sm font-bold text-navy-dark shadow-md transition-all hover:bg-amber-highlight active:scale-95"
                  >
                    ✍️ Tulis Artikel Baru
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/40 hover:bg-white/20"
                  >
                    Tulisan Saya
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                  Halo, <span className="text-amber-brand">{session.user.name || session.user.username}</span>!
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                  Kamu sudah masuk dengan status <strong>Pembaca</strong>. Ingin menulis artikel sekolah? Hubungi admin sekolah untuk mengaktifkan izin menulis pada akunmu.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/tersimpan"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-amber-brand px-7 text-sm font-bold text-navy-dark transition-all hover:bg-amber-highlight active:scale-95"
                  >
                    Artikel Tersimpan
                  </Link>
                  <Link
                    href="/profil"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/40 hover:bg-white/20"
                  >
                    Profil Saya
                  </Link>
                </div>
              </>
            )
          ) : (
            <>
              <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                Ikut menulis untuk sekolah? <span className="text-amber-brand">Mulai dari sini.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                Daftar akun, lalu minta izin menulis kepada admin sekolah. Guru dan
                siswa terpilih dapat membagikan kegiatan, prestasi, dan karya untuk
                dibaca seluruh warga sekolah. {SITE_TAGLINE}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/daftar"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-amber-brand px-7 text-sm font-bold text-navy-dark transition-all hover:bg-amber-highlight active:scale-95"
                >
                  Daftar Akun
                </Link>
                <Link
                  href="/masuk"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/40 hover:bg-white/20"
                >
                  Masuk
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

/** Bangun query-string beranda sambil mempertahankan filter aktif. */
function urutanHref(urutan: string, kategoriSlug?: string, halaman?: number) {
  const sp = new URLSearchParams();
  if (kategoriSlug) sp.set("kategori", kategoriSlug);
  if (urutan && urutan !== "terbaru") sp.set("urutan", urutan);
  if (halaman && halaman > 1) sp.set("hal", String(halaman));
  const qs = sp.toString();
  return qs ? `/?${qs}#artikel-terbaru` : "/#artikel-terbaru";
}
