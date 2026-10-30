"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  VisitorSession,
  TrackingStats,
  getStoredVisitors,
  calculateStats,
  submitGuestBook,
  generateVisitorsCsv,
  deleteVisitor,
  resetAllData,
  exportBackupJson,
  importBackupJson,
  EVENT_DATA_UPDATED,
  formatWib,
  formatDuration,
  isTodayWib,
} from "@/lib/tracking-storage";
import { LOGO_FILES } from "@/lib/constants";
import PrintableReport from "./PrintableReport";

interface TrackRecordDashboardProps {
  mode?: "modal" | "page";
  isOpen?: boolean;
  onClose?: () => void;
}

const GUEST_STATUS_OPTIONS = [
  "Siswa SDN 2 Kemutug Lor",
  "Guru SDN 2 Kemutug Lor",
  "Kepala Sekolah",
  "Orang Tua / Wali Murid",
  "Alumni",
  "Mahasiswa",
  "Pengawas Sekolah",
  "Tamu Umum",
  "Lainnya",
];

export default function TrackRecordDashboard({
  mode = "modal",
  isOpen = true,
  onClose,
}: TrackRecordDashboardProps) {
  const [visitors, setVisitors] = useState<VisitorSession[]>([]);
  const [stats, setStats] = useState<TrackingStats>({
    totalKunjungan: 0,
    kunjunganHariIni: 0,
    pengunjungTerdaftar: 0,
    pengunjungAnonim: 0,
    siswaDanGuru: 0,
    tamuUmum: 0,
    artikelTerpopuler: [],
    halamanTerpopuler: [],
    perangkatTerbanyak: [],
  });

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState<
    "semua" | "hari_ini" | "terdaftar" | "anonim" | "siswa_guru" | "tamu_umum"
  >("semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Accordion form state
  const [formOpen, setFormOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("Siswa SDN 2 Kemutug Lor");
  const [instansi, setInstansi] = useState("SDN 2 Kemutug Lor");
  const [keperluan, setKeperluan] = useState("");
  const [kontak, setKontak] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // Print mode & modal reset
  const [showPrint, setShowPrint] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSecret, setResetSecret] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Muat data dari localStorage
  function loadData() {
    const list = getStoredVisitors();
    setVisitors(list);
    setStats(calculateStats());
  }

  useEffect(() => {
    loadData();

    function onDataChange() {
      loadData();
    }

    window.addEventListener(EVENT_DATA_UPDATED, onDataChange);
    return () => window.removeEventListener(EVENT_DATA_UPDATED, onDataChange);
  }, []);

  // Filter data sesuai kriteria & pencarian
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      // 1. Kriteria filter tab
      if (activeFilter === "hari_ini" && !isTodayWib(v.startTime)) return false;
      if (activeFilter === "terdaftar" && !v.guestId && !v.guestName) return false;
      if (activeFilter === "anonim" && (v.guestId || v.guestName)) return false;
      if (activeFilter === "siswa_guru") {
        const s = (v.guestStatus || "").toLowerCase();
        if (!s.includes("siswa") && !s.includes("guru") && !s.includes("kepala sekolah"))
          return false;
      }
      if (activeFilter === "tamu_umum") {
        const s = (v.guestStatus || "").toLowerCase();
        if (s.includes("siswa") || s.includes("guru") || s.includes("kepala sekolah"))
          return false;
      }

      // 2. Kriteria pencarian
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = (v.guestName || "Pengunjung Anonim").toLowerCase().includes(q);
      const matchContact = (v.guestContact || "").toLowerCase().includes(q);
      const matchStatus = (v.guestStatus || "").toLowerCase().includes(q);
      const matchInstansi = (v.guestInstansi || "").toLowerCase().includes(q);
      const matchActivity = (v.lastActivity || "").toLowerCase().includes(q);
      const matchPage = (v.lastPageOrArticle || "").toLowerCase().includes(q);
      const matchDevice = (v.device || "").toLowerCase().includes(q);

      return (
        matchName ||
        matchContact ||
        matchStatus ||
        matchInstansi ||
        matchActivity ||
        matchPage ||
        matchDevice
      );
    });
  }, [visitors, activeFilter, searchQuery]);

  // Handle Form Submit
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!nama.trim() || !status.trim() || !instansi.trim() || !keperluan.trim()) {
      setFormError("Mohon lengkapi seluruh field wajib bertanda bintang (*).");
      return;
    }

    try {
      submitGuestBook({
        nama,
        status,
        instansi,
        keperluan,
        kontak: kontak || undefined,
      });

      setFormSuccess(`Kunjungan atas nama "${nama}" berhasil dicatat!`);
      setNama("");
      setKeperluan("");
      setKontak("");
      setTimeout(() => setFormSuccess(""), 4000);
    } catch {
      setFormError("Gagal mencatat kunjungan.");
    }
  }

  // Handle Download CSV
  function handleDownloadCsv() {
    const csvContent = generateVisitorsCsv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Rekap_Kunjungan_Krida_Wacana_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Handle Backup JSON
  function handleBackupJson() {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Backup_Krida_Wacana_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Handle Restore JSON File
  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJson(content);
      if (res.success) {
        alert(res.message);
        loadData();
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // Handle Delete Single Record
  function handleDeleteRecord(sessionId: string, name: string) {
    if (confirm(`Hapus catatan riwayat kunjungan "${name}"?`)) {
      deleteVisitor(sessionId);
      loadData();
    }
  }

  // Handle Reset All Data
  function handleExecuteReset() {
    if (resetSecret.trim() !== "RESET") {
      alert('Ketik kata "RESET" dengan huruf kapital untuk mengonfirmasi.');
      return;
    }
    resetAllData();
    setShowResetConfirm(false);
    setResetSecret("");
    loadData();
    alert("Seluruh data Buku Tamu dan Track Record telah berhasil direset.");
  }

  if (mode === "modal" && !isOpen) return null;

  return (
    <>
      {/* Pratinjau Cetak Formal A4 */}
      {showPrint && (
        <PrintableReport
          stats={stats}
          visitors={filteredVisitors}
          onClose={() => setShowPrint(false)}
        />
      )}

      {/* Modal Dialog Pembungkus (jika mode modal) */}
      <div
        className={
          mode === "modal"
            ? "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy-dark/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
            : "w-full"
        }
      >
        <div
          className={`relative w-full overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl transition-all ${
            mode === "modal" ? "max-w-6xl max-h-[92vh] flex flex-col" : "shadow-card"
          }`}
        >
          {/* ======================================================== */}
          {/* HEADER DASHBOARD (Identitas Krida Wacana & Tombol Aksi) */}
          {/* ======================================================== */}
          <div className="shrink-0 bg-navy px-5 py-4 text-white sm:px-7 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Sisi Kiri: Logo & Judul Resmi */}
              <div className="flex items-center gap-3.5">
                {/* Kotak Glass 3 Logo */}
                <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md shadow-sm">
                  <Image
                    src={LOGO_FILES.tutWuri}
                    alt="Logo Tut Wuri"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <Image
                    src={LOGO_FILES.sekolah}
                    alt="Logo SDN 2 Kemutug Lor"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <Image
                    src={LOGO_FILES.krida}
                    alt="Logo Krida Wacana"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full bg-white object-contain"
                  />
                </div>

                <div>
                  <span className="inline-block rounded-md bg-amber-brand/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-amber-brand">
                    Rekap Kunjungan Resmi
                  </span>
                  <h2 className="font-serif text-lg font-bold text-white sm:text-2xl leading-snug">
                    Buku Tamu & Track Record Pengunjung
                  </h2>
                  <p className="text-xs text-white/75 sm:text-xs">
                    KRIDA WACANA &bull; Portal Artikel Sekolah SD Negeri 2 Kemutug Lor
                  </p>
                </div>
              </div>

              {/* Sisi Kanan: Ekspor CSV, Cetak Rekap, Tutup */}
              <div className="flex flex-wrap items-center gap-2 sm:self-center">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95"
                  title="Unduh seluruh data kunjungan ke format Excel / CSV"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Ekspor Excel / CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrint(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-95"
                  title="Cetak laporan formal A4 untuk arsip administrasi & akreditasi"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m11.318-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                  </svg>
                  <span>Cetak Rekap</span>
                </button>

                {mode === "modal" && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                    aria-label="Tutup"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BODY UTAMA DASHBOARD */}
          {/* ======================================================== */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* 1. 4 KARTU STATISTIK RESMI */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
              {/* Kartu 1: Total Kunjungan */}
              <div className="rounded-2xl border border-line bg-gradient-to-br from-white to-slate-50 p-4 text-center shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-secondary">
                  Total Kunjungan
                </p>
                <p className="mt-1 font-serif text-3xl font-extrabold text-navy">
                  {stats.totalKunjungan}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-secondary">Sesi kunjungan situs</p>
              </div>

              {/* Kartu 2: Kunjungan Hari Ini */}
              <div className="rounded-2xl border border-line bg-gradient-to-br from-white to-slate-50 p-4 text-center shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Kunjungan Hari Ini
                </p>
                <p className="mt-1 font-serif text-3xl font-extrabold text-emerald-600">
                  {stats.kunjunganHariIni}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-secondary">Hari berjalan (WIB)</p>
              </div>

              {/* Kartu 3: Pengunjung Terdaftar */}
              <div className="rounded-2xl border border-line bg-gradient-to-br from-white to-slate-50 p-4 text-center shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Pengunjung Terdaftar
                </p>
                <p className="mt-1 font-serif text-3xl font-extrabold text-amber-600">
                  {stats.pengunjungTerdaftar}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-secondary">Mengisi buku tamu</p>
              </div>

              {/* Kartu 4: Pengunjung Anonim */}
              <div className="rounded-2xl border border-line bg-gradient-to-br from-white to-slate-50 p-4 text-center shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Pengunjung Anonim
                </p>
                <p className="mt-1 font-serif text-3xl font-extrabold text-slate-700">
                  {stats.pengunjungAnonim}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-secondary">Tanpa isi buku tamu</p>
              </div>
            </div>

            {/* 2. FORM BUKU TAMU (COLLAPSIBLE ACCORDION SESUAI SCREENSHOT) */}
            <div className="rounded-2xl border border-line bg-surface-muted/40 p-4 shadow-sm">
              <button
                type="button"
                onClick={() => setFormOpen(!formOpen)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">✍️</span>
                  <span className="font-serif text-sm font-bold text-navy sm:text-base">
                    Tinggalkan Jejak Kunjungan Anda (Isi Buku Tamu)
                  </span>
                </div>
                <span className="text-xs font-bold text-ink-secondary">
                  {formOpen ? "▲ Tutup Form" : "▼ Buka Form"}
                </span>
              </button>

              {formOpen && (
                <form onSubmit={handleFormSubmit} className="mt-4 pt-4 border-t border-line space-y-4 animate-in fade-in duration-150">
                  {formSuccess && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
                      ✓ {formSuccess}
                    </div>
                  )}
                  {formError && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800">
                      ⚠ {formError}
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* NAMA LENGKAP */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-secondary">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Contoh: Rian Pratama / Bpk. Sutrisno"
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                      />
                    </div>

                    {/* STATUS / PERAN */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-secondary">
                        Status / Peran *
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                      >
                        {GUEST_STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ASAL SEKOLAH / INSTANSI */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-secondary">
                        Asal Sekolah / Instansi *
                      </label>
                      <input
                        type="text"
                        required
                        value={instansi}
                        onChange={(e) => setInstansi(e.target.value)}
                        placeholder="SDN 2 Kemutug Lor"
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* KEPERLUAN / PESAN KUNJUNGAN */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-secondary">
                        Keperluan / Pesan Kunjungan *
                      </label>
                      <input
                        type="text"
                        required
                        value={keperluan}
                        onChange={(e) => setKeperluan(e.target.value)}
                        placeholder="Contoh: Membaca artikel kegiatan siswa / Peninjauan literasi siswa / Mencari bahan ajar"
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                      />
                    </div>

                    {/* EMAIL / KONTAK */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-secondary">
                        Email / Kontak (Opsional)
                      </label>
                      <input
                        type="text"
                        value={kontak}
                        onChange={(e) => setKontak(e.target.value)}
                        placeholder="email@contoh.com atau No. WA"
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-navy px-5 py-2 text-xs font-bold text-amber-brand shadow transition-all hover:bg-navy-dark active:scale-95"
                    >
                      📝 Catat Kunjungan Saya
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 3. FILTER TABS & SEARCH INPUT (PERSIS SCREENSHOT) */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "semua", label: "Semua Kunjungan" },
                  { id: "hari_ini", label: "Hari Ini" },
                  { id: "terdaftar", label: "Pengunjung Terdaftar" },
                  { id: "anonim", label: "Pengunjung Anonim" },
                  { id: "siswa_guru", label: "Siswa & Guru" },
                  { id: "tamu_umum", label: "Tamu Umum" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveFilter(item.id as any)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeFilter === item.id
                        ? "bg-navy text-amber-brand shadow-sm font-bold"
                        : "bg-surface-muted text-ink-secondary hover:bg-slate-200 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Kolom Pencarian */}
              <div className="relative min-w-[280px] sm:min-w-[340px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pengunjung, artikel, aktivitas..."
                  className="w-full rounded-xl border border-line bg-white pl-9 pr-3.5 py-1.5 text-xs text-ink placeholder:text-ink-secondary/70 outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                />
                <svg
                  className="absolute left-3 top-2.5 h-3.5 w-3.5 text-ink-secondary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2 text-xs text-ink-secondary hover:text-ink"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 4. TABEL RIWAYAT PENGUNJUNG (PERSIS SCREENSHOT 2) */}
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-line bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-ink-secondary">
                      <th className="px-4 py-3">Waktu (WIB)</th>
                      <th className="px-4 py-3">Nama Pengunjung & Email</th>
                      <th className="px-4 py-3">Status & Instansi</th>
                      <th className="px-4 py-3">Aktivitas Terakhir</th>
                      <th className="px-4 py-3">Perangkat</th>
                      <th className="px-4 py-3 text-center">Durasi</th>
                      <th className="px-3 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredVisitors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-ink-secondary">
                          <p className="font-serif text-sm font-semibold">
                            Tidak ditemukan data kunjungan.
                          </p>
                          <p className="mt-1 text-xs text-ink-secondary/70">
                            {searchQuery
                              ? `Tidak ada hasil untuk pencarian "${searchQuery}".`
                              : "Sistem belum mencatat kunjungan dengan filter ini."}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredVisitors.map((v, idx) => {
                        const isRegistered = Boolean(v.guestId || v.guestName);
                        const isSchoolMember = (v.guestStatus || "")
                          .toLowerCase()
                          .match(/siswa|guru|kepala sekolah/);

                        return (
                          <tr
                            key={v.id}
                            className="group transition-colors hover:bg-slate-50/70"
                          >
                            {/* 1. Waktu & Nomor Sesi */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="font-bold text-navy">
                                #{v.sessionNumber || visitors.length - idx}
                              </span>{" "}
                              <span className="font-mono text-[11px] text-ink-secondary">
                                {v.startTimeWib || formatWib(v.startTime)}
                              </span>
                            </td>

                            {/* 2. Nama Pengunjung & Email */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isRegistered
                                      ? isSchoolMember
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-blue-100 text-navy"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {isRegistered
                                    ? (v.guestName || "P")[0].toUpperCase()
                                    : "👤"}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-ink truncate">
                                    {v.guestName || "Pengunjung Tamu Baru"}
                                  </p>
                                  <p className="text-[10px] text-ink-secondary truncate">
                                    {v.guestContact || "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* 3. Status & Instansi */}
                            <td className="px-4 py-3.5">
                              <div>
                                <span
                                  className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                    isRegistered
                                      ? isSchoolMember
                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {v.guestStatus || "Tamu Umum"}
                                </span>
                                <p className="mt-0.5 text-[11px] font-medium text-ink-secondary">
                                  {v.guestInstansi || "SDN 2 Kemutug Lor"}
                                </p>
                              </div>
                            </td>

                            {/* 4. Aktivitas Terakhir */}
                            <td className="px-4 py-3.5 max-w-[220px]">
                              <p className="truncate font-medium text-ink" title={v.lastActivity}>
                                {v.lastActivity || "Membuka Beranda"}
                              </p>
                              {v.lastPageOrArticle && v.lastPageOrArticle !== v.lastActivity && (
                                <p className="truncate text-[10px] text-ink-secondary" title={v.lastPageOrArticle}>
                                  {v.lastPageOrArticle}
                                </p>
                              )}
                            </td>

                            {/* 5. Perangkat */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-secondary">
                                {v.deviceType === "mobile" ? "📱" : v.deviceType === "tablet" ? "📟" : "💻"}
                                <span>{v.device}</span>
                              </span>
                            </td>

                            {/* 6. Durasi */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono text-[11px] text-ink-secondary">
                              {formatDuration(v.durationSeconds)}
                            </td>

                            {/* 7. Aksi Hapus */}
                            <td className="px-3 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteRecord(
                                    v.id,
                                    v.guestName || `Sesi #${v.sessionNumber}`
                                  )
                                }
                                className="rounded-lg p-1 text-slate-400 opacity-60 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                                title="Hapus riwayat kunjungan ini"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* FOOTER DASHBOARD & ADMINISTRASI DATA (LOCALSTORAGE) */}
          {/* ======================================================== */}
          <div className="shrink-0 border-t border-line bg-slate-50 px-5 py-3 sm:px-7 sm:py-3.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
              <div className="flex items-center gap-2 text-ink-secondary">
                <span>⚠️</span>
                <span className="text-[11px]">
                  Rekap kunjungan tercatat otomatis untuk keperluan evaluasi & laporan akreditasi sekolah SDN 2 Kemutug Lor.
                </span>
              </div>

              {/* Alat Kelola Data (Backup, Pulihkan, Reset) */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleBackupJson}
                  className="rounded-xl border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-secondary shadow-sm hover:bg-slate-50 hover:text-navy"
                  title="Unduh file backup data JSON"
                >
                  💾 Backup JSON
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-secondary shadow-sm hover:bg-slate-50 hover:text-navy"
                  title="Pulihkan data dari file backup JSON"
                >
                  📥 Pulihkan JSON
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                  title="Reset seluruh riwayat data (khusus admin)"
                >
                  🗑️ Reset Data
                </button>

                {mode === "modal" && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-navy px-4 py-1.5 text-[11px] font-bold text-amber-brand hover:bg-navy-dark shadow-sm"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Reset Data Khusus Admin */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-serif text-lg font-bold text-rose-600">
              Konfirmasi Reset Seluruh Data
            </h3>
            <p className="mt-2 text-xs text-ink-secondary leading-relaxed">
              Tindakan ini akan mengosongkan seluruh riwayat buku tamu dan catatan kunjungan di browser ini. Data yang dihapus tidak dapat dipulihkan kecuali Anda memiliki cadangan file JSON.
            </p>
            <p className="mt-3 text-xs font-semibold text-ink">
              Ketik kata <span className="font-mono text-rose-600 font-bold">RESET</span> untuk melanjutkan:
            </p>
            <input
              type="text"
              value={resetSecret}
              onChange={(e) => setResetSecret(e.target.value)}
              placeholder="Ketik RESET"
              className="mt-1.5 w-full rounded-xl border border-line p-2 text-xs outline-none focus:border-rose-500 font-mono"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetSecret("");
                }}
                className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

