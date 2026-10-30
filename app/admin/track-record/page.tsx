import TrackRecordDashboard from "@/components/tracking/TrackRecordDashboard";

export const metadata = {
  title: "Buku Tamu & Track Record Pengunjung",
};

export default function AdminTrackRecordPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
          Buku Tamu & Track Record Pengunjung
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Pemantauan statistik kunjungan, aktivitas pembaca, dan buku tamu portal artikel Krida Wacana SD Negeri 2 Kemutug Lor.
        </p>
      </header>

      <TrackRecordDashboard mode="page" />
    </div>
  );
}

