"use client";

import { useState } from "react";
import Image from "next/image";
import { LOGO_FILES } from "@/lib/constants";
import { submitGuestBook } from "@/lib/tracking-storage";
import TrackRecordDashboard from "./TrackRecordDashboard";

const STATUS_OPTIONS = [
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

export default function GuestBookModal({
  isOpen,
  onClose,
  onOpenDashboard,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenDashboard?: () => void;
}) {
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("Tamu Umum");
  const [instansi, setInstansi] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [kontak, setKontak] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nama.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!status.trim()) {
      setError("Pilih status/peran Anda.");
      return;
    }
    if (!instansi.trim()) {
      setError("Asal sekolah atau instansi wajib diisi.");
      return;
    }
    if (!keperluan.trim()) {
      setError("Keperluan/tujuan kunjungan wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      submitGuestBook({
        nama,
        status,
        instansi,
        keperluan,
        kontak: kontak || undefined,
      });

      setSuccess(true);
    } catch {
      setError("Gagal menyimpan data buku tamu.");
    } finally {
      setLoading(false);
    }
  }

  function handleViewDashboard() {
    onClose();
    if (onOpenDashboard) {
      onOpenDashboard();
    } else {
      setShowDashboardModal(true);
    }
  }

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Header Modal */}
          <div className="relative bg-navy px-6 py-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* 3 Logo box */}
                <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 p-1.5 backdrop-blur-md">
                  <Image
                    src={LOGO_FILES.tutWuri}
                    alt="Tut Wuri"
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                  <Image
                    src={LOGO_FILES.sekolah}
                    alt="SDN 2 Kemutug Lor"
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                  <Image
                    src={LOGO_FILES.krida}
                    alt="Krida Wacana"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full bg-white object-contain"
                  />
                </div>

                <div>
                  <span className="inline-block rounded-md bg-amber-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-brand">
                    Buku Tamu Resmi
                  </span>
                  <h3 className="font-serif text-lg font-bold leading-tight text-white sm:text-xl">
                    ✍️ Tinggalkan Jejak Kunjungan Anda
                  </h3>
                  <p className="text-[11px] text-white/70">
                    SD Negeri 2 Kemutug Lor, Baturraden
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6">
            {success ? (
              <div className="py-6 text-center animate-in zoom-in-95 duration-300">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="mt-4 font-serif text-xl font-bold text-navy">
                  Terima Kasih, {nama}!
                </h4>
                <p className="mt-2 text-xs text-ink-secondary leading-relaxed">
                  Jejak kunjungan Anda telah resmi dicatat dalam sistem Buku Tamu & Track Record Krida Wacana.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                  <span>✓ Sesi kunjungan terhubung otomatis ke statistik</span>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleViewDashboard}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-xs font-bold text-amber-brand shadow-md hover:bg-navy-dark active:scale-95"
                  >
                    <span>📊</span>
                    <span>Lihat Riwayat & Rekap Kunjungan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setNama("");
                      setInstansi("");
                      setKeperluan("");
                      setKontak("");
                      onClose();
                    }}
                    className="w-full sm:w-auto rounded-xl border border-line px-4 py-2.5 text-xs font-semibold text-ink-secondary hover:bg-slate-50"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                    {error}
                  </div>
                )}

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Rian Pratama / Bpk. Sutrisno"
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface-muted/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10"
                  />
                </div>

                {/* Status / Peran & Asal Sekolah / Instansi */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary">
                      Status / Peran <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-line bg-surface-muted/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary">
                      Asal Instansi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                      placeholder="Contoh: SDN 2 Kemutug Lor"
                      className="mt-1.5 w-full rounded-xl border border-line bg-surface-muted/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10"
                    />
                  </div>
                </div>

                {/* Keperluan / Pesan Kunjungan */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary">
                    Keperluan / Pesan Kunjungan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={keperluan}
                    onChange={(e) => setKeperluan(e.target.value)}
                    placeholder="Contoh: Membaca artikel kegiatan siswa / Peninjauan literasi sekolah"
                    className="mt-1.5 w-full resize-none rounded-xl border border-line bg-surface-muted/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10"
                  />
                </div>

                {/* Email / Kontak (Opsional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary">
                    Email / Kontak (Opsional)
                  </label>
                  <input
                    type="text"
                    value={kontak}
                    onChange={(e) => setKontak(e.target.value)}
                    placeholder="email@contoh.com atau No. WhatsApp"
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface-muted/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10"
                  />
                </div>

                {/* Tombol Simpan & Akses Rekap */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleViewDashboard}
                    className="flex items-center gap-1.5 text-xs font-semibold text-navy hover:underline"
                  >
                    <span>📊</span>
                    <span>Lihat Rekap & Riwayat</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-xs font-bold text-amber-brand shadow-md transition-all hover:bg-navy-dark hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                    {loading ? "Menyimpan..." : "📝 Catat Kunjungan Saya"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {showDashboardModal && (
        <TrackRecordDashboard
          mode="modal"
          isOpen={true}
          onClose={() => setShowDashboardModal(false)}
        />
      )}
    </>
  );
}

/**
 * Komponen Tombol Melayang (Floating Trigger)
 * Menampilkan pilihan Isi Buku Tamu dan Rekap Kunjungan
 */
export function FloatingGuestBookButton() {
  const [open, setOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDashboardOpen(true)}
          className="group flex items-center gap-1.5 rounded-full border border-white/20 bg-navy/95 px-3.5 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur transition-all hover:scale-105 hover:bg-navy-dark hover:text-amber-brand active:scale-95 sm:text-sm"
          title="Lihat Buku Tamu & Track Record Pengunjung"
        >
          <span>📊</span>
          <span className="hidden sm:inline">Rekap Riwayat</span>
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-amber-brand/30 bg-navy px-4 py-2.5 text-xs font-bold text-amber-brand shadow-xl backdrop-blur transition-all hover:scale-105 hover:bg-navy-dark hover:shadow-2xl active:scale-95 sm:text-sm"
          title="Isi Buku Tamu Krida Wacana"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-brand/20 text-xs">
            ✍️
          </span>
          <span>Buku Tamu</span>
          <span className="hidden text-[10px] font-normal text-white/70 group-hover:inline sm:inline">
            • SD Negeri 2 Kemutug Lor
          </span>
        </button>
      </div>

      <GuestBookModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onOpenDashboard={() => setDashboardOpen(true)}
      />

      <TrackRecordDashboard
        mode="modal"
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
      />
    </>
  );
}

