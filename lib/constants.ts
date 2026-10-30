/**
 * Konstanta branding & identitas SD Negeri 2 Kemutug Lor.
 * Nama situs WAJIB tetap "Krida Wacana".
 */

export const SITE_NAME = "Krida Wacana";
export const SITE_TAGLINE = "Tulis. Bagikan. Dibaca Semua Orang.";

export const SCHOOL_NAME = "SD Negeri 2 Kemutug Lor";
export const SCHOOL_NAME_UPPER =
  "SD NEGERI 2 KEMUTUG LOR, KEC. BATURRADEN, BANYUMAS";
export const SCHOOL_ADDRESS =
  "SD Negeri 2 Kemutug Lor, Kec. Baturraden, Kab. Banyumas, Jawa Tengah";

export const SITE_DESCRIPTION =
  "Krida Wacana — portal artikel SD Negeri 2 Kemutug Lor, Kec. Baturraden, " +
  "Kab. Banyumas. Media publikasi kegiatan sekolah, prestasi siswa, " +
  "pembelajaran, dan karya warga sekolah di lereng Gunung Slamet.";

/** Nilai warna brand (untuk metadata theme-color dsb.) */
export const BRAND_COLORS = {
  navy: "#0B1F4B",
  navyDark: "#07142F",
  amber: "#FBBF24",
} as const;

/** Link navigasi dasar header (kategori sesuai seed). */
export const HEADER_NAV = [
  { label: "Beranda", href: "/" },
  { label: "Profil Sekolah", href: "/kategori/profil-sekolah" },
  { label: "Kegiatan", href: "/kategori/kegiatan-sekolah" },
  { label: "Prestasi", href: "/kategori/prestasi" },
  { label: "Pembelajaran", href: "/kategori/pembelajaran" },
  { label: "Ekstrakurikuler", href: "/kategori/ekstrakurikuler" },
];

export const FOOTER_COLUMNS = [
  {
    title: "Jelajah",
    links: [
      { label: "Beranda", href: "/" },
      { label: "Semua Artikel", href: "/#artikel-terbaru" },
      { label: "Pencarian", href: "/cari" },
    ],
  },
  {
    title: "Warga Sekolah",
    links: [
      { label: "Tulis Artikel", href: "/tulis" },
      { label: "Daftar", href: "/daftar" },
      { label: "Masuk", href: "/masuk" },
    ],
  },
  {
    title: "Kategori",
    links: [
      { label: "Profil Sekolah", href: "/kategori/profil-sekolah" },
      { label: "Kegiatan Sekolah", href: "/kategori/kegiatan-sekolah" },
      { label: "Karya Siswa", href: "/kategori/karya-siswa" },
    ],
  },
];

/** Nama file logo (dipakai BrandLogo, favicon, dan og:image). */
export const LOGO_FILES = {
  tutWuri: "/logo/tut-wuri-handayani.webp",
  sekolah: "/logo/sdn2-kemutug-lor.png",
  krida: "/logo/krida-wacana.png",
} as const;
