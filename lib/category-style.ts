/**
 * Pemetaan kategori → gradien cover (untuk kartu tanpa foto).
 * Dipakai deterministik berdasarkan nama kategori.
 */
export const CATEGORY_GRADIENTS: Record<string, string> = {
  "Profil Sekolah": "from-blue-600 to-navy-royal",
  "Kegiatan Sekolah": "from-amber-500 to-orange-700",
  Prestasi: "from-amber-400 to-amber-700",
  Pembelajaran: "from-emerald-600 to-green-900",
  Ekstrakurikuler: "from-cyan-600 to-teal-900",
  Pengumuman: "from-indigo-600 to-violet-900",
  "Karya Siswa": "from-purple-600 to-fuchsia-900",
};

const PALET_FALLBACK = [
  "from-blue-600 to-navy-royal",
  "from-amber-500 to-rose-700",
  "from-emerald-600 to-cyan-900",
  "from-indigo-500 to-purple-800",
  "from-slate-600 to-navy-dark",
];

export function gradientForCategory(name: string): string {
  return CATEGORY_GRADIENTS[name] ?? PALET_FALLBACK[name.length % PALET_FALLBACK.length];
}
