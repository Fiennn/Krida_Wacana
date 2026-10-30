"use client";

import Image from "next/image";
import {
  formatWib,
  formatWibDateOnly,
  formatDuration,
  VisitorSession,
  TrackingStats,
} from "@/lib/tracking-storage";
import { LOGO_FILES, SCHOOL_NAME, SCHOOL_ADDRESS } from "@/lib/constants";

interface PrintableReportProps {
  stats: TrackingStats;
  visitors: VisitorSession[];
  onClose: () => void;
}

export default function PrintableReport({
  stats,
  visitors,
  onClose,
}: PrintableReportProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 p-4 backdrop-blur-md print:p-0 print:bg-white">
      {/* Tombol Aksi di Atas (Sembunyi saat dicetak) */}
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between rounded-2xl bg-white p-4 shadow-lg print:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-amber-brand">
            🖨️
          </span>
          <div>
            <h3 className="text-sm font-bold text-navy">Pratinjau Cetak Laporan A4</h3>
            <p className="text-xs text-ink-secondary">
              Laporan Rekap Kunjungan Resmi SD Negeri 2 Kemutug Lor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-amber-brand shadow transition-all hover:bg-navy-dark active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m11.318-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
            Cetak Sekarang
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink-secondary hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Lembar Dokumen A4 Resmi */}
      <div className="mx-auto max-w-[210mm] bg-white p-8 text-black shadow-2xl print:max-w-none print:p-0 print:shadow-none">
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-navy pb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Tut Wuri */}
            <div className="relative h-20 w-20 shrink-0">
              <Image
                src={LOGO_FILES.tutWuri}
                alt="Logo Tut Wuri Handayani"
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Teks Kop Sekolah */}
            <div className="flex-1 text-center">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                PEMERINTAH KABUPATEN BANYUMAS &bull; DINAS PENDIDIKAN
              </h4>
              <h2 className="font-serif text-xl font-extrabold uppercase tracking-tight text-navy sm:text-2xl">
                {SCHOOL_NAME}
              </h2>
              <p className="text-xs font-semibold text-slate-800">
                KORWILCAM DINDIK BATURRADEN &bull; KABUPATEN BANYUMAS
              </p>
              <p className="text-[11px] text-slate-600">
                {SCHOOL_ADDRESS}
              </p>
              <p className="text-[10px] font-semibold text-navy">
                Portal Artikel Sekolah: KRIDA WACANA &bull; https://kridawacanaperpusdigital.vercel.app
              </p>
            </div>

            {/* Logo SDN 2 Kemutug Lor & Krida Wacana */}
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative h-16 w-16">
                <Image
                  src={LOGO_FILES.sekolah}
                  alt="Logo SDN 2 Kemutug Lor"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="relative h-14 w-14">
                <Image
                  src={LOGO_FILES.krida}
                  alt="Logo Krida Wacana"
                  width={56}
                  height={56}
                  className="h-full w-full rounded-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Judul Laporan */}
        <div className="my-6 text-center">
          <h1 className="font-serif text-lg font-bold uppercase tracking-wide text-navy underline decoration-navy decoration-2 underline-offset-4">
            LAPORAN REKAPITULASI BUKU TAMU & TRACK RECORD PENGUNJUNG
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Media Publikasi & Portal Artikel Sekolah SD Negeri 2 Kemutug Lor
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Tanggal Cetak: {formatWib()} &bull; Lokasi: Baturraden, Banyumas
          </p>
        </div>

        {/* Ringkasan Statistik Utama (4 Kartu) */}
        <div className="mb-6 grid grid-cols-4 gap-3 text-center">
          <div className="rounded-lg border border-slate-300 bg-slate-50 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-600">Total Kunjungan</p>
            <p className="mt-1 font-serif text-2xl font-bold text-navy">{stats.totalKunjungan}</p>
            <p className="text-[9px] text-slate-500">Seluruh Kunjungan</p>
          </div>
          <div className="rounded-lg border border-slate-300 bg-slate-50 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-600">Kunjungan Hari Ini</p>
            <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">{stats.kunjunganHariIni}</p>
            <p className="text-[9px] text-slate-500">Hari Berjalan (WIB)</p>
          </div>
          <div className="rounded-lg border border-slate-300 bg-slate-50 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-600">Pengunjung Terdaftar</p>
            <p className="mt-1 font-serif text-2xl font-bold text-amber-700">{stats.pengunjungTerdaftar}</p>
            <p className="text-[9px] text-slate-500">Mengisi Buku Tamu</p>
          </div>
          <div className="rounded-lg border border-slate-300 bg-slate-50 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-600">Pengunjung Anonim</p>
            <p className="mt-1 font-serif text-2xl font-bold text-slate-700">{stats.pengunjungAnonim}</p>
            <p className="text-[9px] text-slate-500">Pembaca Tamu</p>
          </div>
        </div>

        {/* Tabel Ringkasan Aktivitas Terpopuler */}
        {stats.artikelTerpopuler.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
              Aktivitas Artikel Paling Diminati
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-left text-xs">
              <thead>
                <tr className="bg-slate-100 font-semibold text-slate-800">
                  <th className="border border-slate-300 px-2 py-1 text-center w-8">No</th>
                  <th className="border border-slate-300 px-2 py-1">Judul Artikel / Halaman</th>
                  <th className="border border-slate-300 px-2 py-1 text-center w-28">Jumlah Dibaca</th>
                </tr>
              </thead>
              <tbody>
                {stats.artikelTerpopuler.map((art, idx) => (
                  <tr key={art.title}>
                    <td className="border border-slate-300 px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 px-2 py-1">{art.title}</td>
                    <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                      {art.count} kali
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabel Detail Riwayat Pengunjung */}
        <div className="mb-8">
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
            Daftar Riwayat Kunjungan Pengunjung
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800">
                <th className="border border-slate-300 px-2 py-1.5 text-center w-10">No</th>
                <th className="border border-slate-300 px-2 py-1.5 w-36">Waktu (WIB)</th>
                <th className="border border-slate-300 px-2 py-1.5">Nama & Kontak</th>
                <th className="border border-slate-300 px-2 py-1.5">Status & Instansi</th>
                <th className="border border-slate-300 px-2 py-1.5">Aktivitas Terakhir</th>
                <th className="border border-slate-300 px-2 py-1.5 w-28">Perangkat</th>
                <th className="border border-slate-300 px-2 py-1.5 text-center w-16">Durasi</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-slate-300 p-4 text-center text-slate-500">
                    Belum ada data kunjungan yang tercatat.
                  </td>
                </tr>
              ) : (
                visitors.map((v, i) => (
                  <tr key={v.id} className={i % 2 === 1 ? "bg-slate-50/50" : ""}>
                    <td className="border border-slate-300 px-2 py-1 text-center font-semibold">
                      #{v.sessionNumber || visitors.length - i}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 font-mono text-[10px]">
                      {v.startTimeWib || formatWib(v.startTime)}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 font-semibold text-slate-900">
                      <div>{v.guestName || "Pengunjung Anonim"}</div>
                      {v.guestContact && (
                        <div className="text-[10px] font-normal text-slate-500">{v.guestContact}</div>
                      )}
                    </td>
                    <td className="border border-slate-300 px-2 py-1">
                      <div className="font-semibold">{v.guestStatus || "Tamu Umum"}</div>
                      <div className="text-[10px] text-slate-500">{v.guestInstansi || "SDN 2 Kemutug Lor"}</div>
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-slate-700">
                      {v.lastActivity || "Membuka Beranda"}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-[10px] text-slate-600">
                      {v.device}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center font-medium">
                      {formatDuration(v.durationSeconds)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Kolom Tanda Tangan Resmi */}
        <div className="mt-8 break-inside-avoid pt-4 text-xs">
          <div className="flex justify-between">
            <div className="text-center w-64">
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala SD Negeri 2 Kemutug Lor</p>
              <div className="h-16" />
              <p className="font-bold underline decoration-1 underline-offset-2">
                ( ................................................. )
              </p>
              <p className="text-[11px] text-slate-500">NIP. ....................................</p>
            </div>

            <div className="text-center w-64">
              <p>Baturraden, {formatWibDateOnly()}</p>
              <p className="font-bold">Administrator Krida Wacana</p>
              <div className="h-16" />
              <p className="font-bold underline decoration-1 underline-offset-2">
                ( Tim Literasi & IT Sekolah )
              </p>
              <p className="text-[11px] text-slate-500">SD Negeri 2 Kemutug Lor</p>
            </div>
          </div>
        </div>

        {/* Catatan Kaki */}
        <div className="mt-8 border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400">
          Laporan ini diterbitkan secara otomatis oleh Sistem Buku Tamu & Track Record Portal Artikel Krida Wacana.
        </div>
      </div>
    </div>
  );
}

