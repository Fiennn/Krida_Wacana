/**
 * Sistem Penyimpanan & Tracking Kunjungan Krida Wacana
 * Menggunakan Browser LocalStorage & SessionStorage tanpa database eksternal.
 *
 * SD Negeri 2 Kemutug Lor, Kec. Baturraden, Kab. Banyumas
 * Portal Artikel Sekolah Krida Wacana
 */

export interface GuestBookEntry {
  id: string;
  visitorId: string;
  sessionId: string;
  nama: string; // wajib
  status: string; // wajib (Siswa, Guru, Kepala Sekolah, Orang Tua / Wali Murid, Alumni, Mahasiswa, Pengawas Sekolah, Tamu Umum, Lainnya)
  instansi: string; // wajib
  keperluan: string; // wajib
  kontak?: string; // opsional (email / no hp/wa)
  createdAt: string; // ISO
  createdAtWib: string; // e.g. "29 Okt 2026, 21.38.21 WIB"
}

export interface VisitorSession {
  id: string; // sessionId
  sessionNumber: number; // #1, #2, ...
  visitorId: string;
  guestId?: string;
  guestName?: string;
  guestContact?: string;
  guestStatus?: string;
  guestInstansi?: string;
  startTime: string; // ISO
  lastActiveTime: string; // ISO
  startTimeWib: string;
  lastActiveTimeWib: string;
  durationSeconds: number;
  lastActivity: string; // e.g. "Membuka Beranda", "Membaca Artikel: ..."
  lastPageOrArticle: string;
  device: string; // e.g. "Windows PC • Google Chrome"
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
}

export interface VisitorActivity {
  id: string;
  sessionId: string;
  visitorId: string;
  type:
    | "page_view"
    | "article_view"
    | "article_read"
    | "search"
    | "category_view"
    | "share"
    | "guestbook_submit";
  title: string;
  path: string;
  details?: string;
  timestamp: string;
  timestampWib: string;
}

export interface TrackingStats {
  totalKunjungan: number;
  kunjunganHariIni: number;
  pengunjungTerdaftar: number;
  pengunjungAnonim: number;
  siswaDanGuru: number;
  tamuUmum: number;
  artikelTerpopuler: { title: string; count: number }[];
  halamanTerpopuler: { path: string; title: string; count: number }[];
  perangkatTerbanyak: { name: string; count: number }[];
}

export const STORAGE_KEYS = {
  GUESTS: "krida_wacana_guests",
  VISITORS: "krida_wacana_visitors",
  ACTIVITIES: "krida_wacana_activities",
  SETTINGS: "krida_wacana_settings",
  SESSION_ID: "krida_wacana_session_id",
  VISITOR_ID: "krida_wacana_visitor_id",
} as const;

export const EVENT_DATA_UPDATED = "krida_wacana_storage_updated";

/** Helper: Cek apakah kode sedang dieksekusi di browser */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/** Broadcast event ketika data berubah agar UI sinkron real-time */
export function notifyDataUpdated() {
  if (!isBrowser()) return;
  try {
    window.dispatchEvent(new CustomEvent(EVENT_DATA_UPDATED));
  } catch (err) {
    console.error("Gagal broadcast update:", err);
  }
}

/** Daftar nama bulan Bahasa Indonesia */
const BULAN_INDONESIA = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Format tanggal dan waktu menjadi format WIB (UTC+7).
 * Contoh output: "29 Okt 2026, 21.38.21 WIB"
 */
export function formatWib(dateInput?: Date | string | number): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return "-";

  // Hitung offset WIB (UTC+7)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);

  const tgl = wibDate.getDate();
  const bln = BULAN_INDONESIA[wibDate.getMonth()];
  const thn = wibDate.getFullYear();
  const jam = String(wibDate.getHours()).padStart(2, "0");
  const mnt = String(wibDate.getMinutes()).padStart(2, "0");
  const dtk = String(wibDate.getSeconds()).padStart(2, "0");

  return `${tgl} ${bln} ${thn}, ${jam}.${mnt}.${dtk} WIB`;
}

/** Format tanggal saja dalam WIB: "29 Okt 2026" */
export function formatWibDateOnly(dateInput?: Date | string | number): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return "-";
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  return `${wibDate.getDate()} ${BULAN_INDONESIA[wibDate.getMonth()]} ${wibDate.getFullYear()}`;
}

/** Cek apakah tanggal berada pada hari ini di WIB */
export function isTodayWib(dateInput?: Date | string | number): boolean {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibNow = new Date(utcNow + 7 * 3600000);

  const utcTarget = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibTarget = new Date(utcTarget + 7 * 3600000);

  return (
    wibNow.getFullYear() === wibTarget.getFullYear() &&
    wibNow.getMonth() === wibTarget.getMonth() &&
    wibNow.getDate() === wibTarget.getDate()
  );
}

/** Format durasi kunjungan (detik) menjadi string yang mudah dibaca */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 30) return "< 1m";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  if (m < 60) return `${m}m ${s > 0 ? `${s}s` : ""}`.trim();
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}j ${remM}m`;
}

/**
 * Deteksi informasi perangkat dan browser menggunakan standar Browser API.
 * Hasil contoh: "Windows PC • Google Chrome", "Android Mobile • Chrome"
 */
export function getDeviceInfo(): {
  device: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
} {
  if (!isBrowser()) {
    return {
      device: "Desktop PC • Browser",
      deviceType: "desktop",
      browser: "Browser",
      os: "Unknown OS",
    };
  }

  const ua = navigator.userAgent || "";
  let os = "Perangkat Umum";
  let browser = "Web Browser";
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";

  // Deteksi Tipe Perangkat
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = "tablet";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    deviceType = "mobile";
  } else {
    deviceType = "desktop";
  }

  // Deteksi OS
  if (/Windows NT 10.0/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // Deteksi Browser
  if (/Edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium|Edg/i.test(ua))
    browser = "Google Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Mozilla Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome|Edg/i.test(ua)) browser = "Safari";
  else if (/OPR\/|Opera\//i.test(ua)) browser = "Opera";

  const typeLabel =
    deviceType === "mobile"
      ? "Mobile"
      : deviceType === "tablet"
      ? "Tablet"
      : "PC";

  const device = `${os} ${typeLabel} • ${browser}`;

  return { device, deviceType, browser, os };
}

/** Generate ID unik acak */
function generateId(prefix = "kw"): string {
  const rnd = Math.random().toString(36).substring(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rnd}`;
}

/** Ambil atau inisialisasi Visitor ID unik di LocalStorage */
export function getOrCreateVisitorId(): string {
  if (!isBrowser()) return "server_visitor";
  try {
    let vid = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    if (!vid) {
      vid = generateId("vis");
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, vid);
    }
    return vid;
  } catch {
    return generateId("vis");
  }
}

/** Ambil atau inisialisasi Session ID unik di SessionStorage */
export function getOrCreateSessionId(): { sessionId: string; isNew: boolean } {
  if (!isBrowser()) return { sessionId: "server_session", isNew: false };
  try {
    let sid = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (sid) {
      return { sessionId: sid, isNew: false };
    }
    sid = generateId("ses");
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sid);
    return { sessionId: sid, isNew: true };
  } catch {
    return { sessionId: generateId("ses"), isNew: true };
  }
}

// -------------------------------------------------------------
// OPERASI DATA LOCALSTORAGE
// -------------------------------------------------------------

export function getStoredGuests(): GuestBookEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUESTS);
    if (!raw) return [];
    return JSON.parse(raw) as GuestBookEntry[];
  } catch (err) {
    console.error("Gagal membaca buku tamu dari localStorage:", err);
    return [];
  }
}

export function saveStoredGuests(guests: GuestBookEntry[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
    notifyDataUpdated();
  } catch (err) {
    console.error("Gagal menyimpan buku tamu ke localStorage:", err);
  }
}

export function getStoredVisitors(): VisitorSession[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISITORS);
    if (!raw) return [];
    return JSON.parse(raw) as VisitorSession[];
  } catch (err) {
    console.error("Gagal membaca riwayat pengunjung dari localStorage:", err);
    return [];
  }
}

export function saveStoredVisitors(visitors: VisitorSession[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(visitors));
    notifyDataUpdated();
  } catch (err) {
    console.error("Gagal menyimpan pengunjung ke localStorage:", err);
  }
}

export function getStoredActivities(): VisitorActivity[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) return [];
    return JSON.parse(raw) as VisitorActivity[];
  } catch (err) {
    console.error("Gagal membaca aktivitas dari localStorage:", err);
    return [];
  }
}

export function saveStoredActivities(activities: VisitorActivity[]): void {
  if (!isBrowser()) return;
  try {
    // Batasi aktivitas maksimal 1000 entri terakhir agar localStorage tidak meluap
    const trimmed = activities.slice(-1000);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Gagal menyimpan aktivitas ke localStorage:", err);
  }
}

/**
 * Inisialisasi atau perbarui sesi pengunjung saat ini.
 * Mencegah refresh halaman dihitung sebagai pengunjung baru.
 */
export function initOrUpdateSession(
  activityTitle?: string,
  pageOrArticle?: string
): VisitorSession | null {
  if (!isBrowser()) return null;

  const visitorId = getOrCreateVisitorId();
  const { sessionId } = getOrCreateSessionId();
  const visitors = getStoredVisitors();
  const now = new Date();
  const nowIso = now.toISOString();
  const nowWib = formatWib(now);
  const { device, deviceType, browser, os } = getDeviceInfo();

  let sessionIndex = visitors.findIndex((v) => v.id === sessionId);

  // Jika belum ada di list session, cari apakah visitor ini sudah pernah isi buku tamu
  const guests = getStoredGuests();
  const existingGuest = guests.find((g) => g.visitorId === visitorId);

  if (sessionIndex === -1) {
    // Buat session baru
    const nextNumber = visitors.length > 0 ? Math.max(...visitors.map((v) => v.sessionNumber || 0)) + 1 : 1;
    const newSession: VisitorSession = {
      id: sessionId,
      sessionNumber: nextNumber,
      visitorId,
      guestId: existingGuest?.id,
      guestName: existingGuest?.nama,
      guestContact: existingGuest?.kontak,
      guestStatus: existingGuest?.status,
      guestInstansi: existingGuest?.instansi,
      startTime: nowIso,
      lastActiveTime: nowIso,
      startTimeWib: nowWib,
      lastActiveTimeWib: nowWib,
      durationSeconds: 0,
      lastActivity: activityTitle || "Membuka Beranda",
      lastPageOrArticle: pageOrArticle || "Beranda",
      device,
      deviceType,
      browser,
      os,
    };

    visitors.unshift(newSession); // tempatkan terbaru di paling depan
    saveStoredVisitors(visitors);
    return newSession;
  } else {
    // Perbarui session yang ada
    const current = visitors[sessionIndex];
    const start = new Date(current.startTime).getTime();
    const duration = Math.max(0, Math.floor((now.getTime() - start) / 1000));

    current.lastActiveTime = nowIso;
    current.lastActiveTimeWib = nowWib;
    current.durationSeconds = duration;
    if (activityTitle) current.lastActivity = activityTitle;
    if (pageOrArticle) current.lastPageOrArticle = pageOrArticle;

    if (existingGuest && !current.guestId) {
      current.guestId = existingGuest.id;
      current.guestName = existingGuest.nama;
      current.guestContact = existingGuest.kontak;
      current.guestStatus = existingGuest.status;
      current.guestInstansi = existingGuest.instansi;
    }

    saveStoredVisitors(visitors);
    return current;
  }
}

/**
 * Catat aktivitas spesifik pengunjung
 */
export function recordActivity(
  type: VisitorActivity["type"],
  title: string,
  path: string,
  details?: string
): void {
  if (!isBrowser()) return;

  const visitorId = getOrCreateVisitorId();
  const { sessionId } = getOrCreateSessionId();
  const now = new Date();

  const activity: VisitorActivity = {
    id: generateId("act"),
    sessionId,
    visitorId,
    type,
    title,
    path,
    details,
    timestamp: now.toISOString(),
    timestampWib: formatWib(now),
  };

  const activities = getStoredActivities();
  activities.push(activity);
  saveStoredActivities(activities);

  // Perbarui session aktif
  initOrUpdateSession(title, details || title);
}

/**
 * Simpan entri formulir Buku Tamu baru ke LocalStorage
 */
export function submitGuestBook(entry: {
  nama: string;
  status: string;
  instansi: string;
  keperluan: string;
  kontak?: string;
}): GuestBookEntry | null {
  if (!isBrowser()) return null;

  const visitorId = getOrCreateVisitorId();
  const { sessionId } = getOrCreateSessionId();
  const now = new Date();
  const nowWib = formatWib(now);

  const newGuest: GuestBookEntry = {
    id: generateId("gst"),
    visitorId,
    sessionId,
    nama: entry.nama.trim(),
    status: entry.status.trim(),
    instansi: entry.instansi.trim(),
    keperluan: entry.keperluan.trim(),
    kontak: entry.kontak?.trim() || undefined,
    createdAt: now.toISOString(),
    createdAtWib: nowWib,
  };

  // 1. Simpan ke daftar buku tamu
  const guests = getStoredGuests();
  guests.unshift(newGuest);
  saveStoredGuests(guests);

  // 2. Hubungkan data buku tamu ke sesi pengunjung di `krida_wacana_visitors`
  const visitors = getStoredVisitors();
  for (const v of visitors) {
    if (v.id === sessionId || v.visitorId === visitorId) {
      v.guestId = newGuest.id;
      v.guestName = newGuest.nama;
      v.guestContact = newGuest.kontak;
      v.guestStatus = newGuest.status;
      v.guestInstansi = newGuest.instansi;
      v.lastActivity = "Mengisi Buku Tamu";
    }
  }
  saveStoredVisitors(visitors);

  // 3. Catat aktivitas
  recordActivity(
    "guestbook_submit",
    `Mengisi Buku Tamu: ${newGuest.nama} (${newGuest.status})`,
    "/buku-tamu",
    newGuest.keperluan
  );

  return newGuest;
}

/**
 * Hitung seluruh statistik untuk 4 kartu dan analitik
 */
export function calculateStats(): TrackingStats {
  const visitors = getStoredVisitors();
  const activities = getStoredActivities();

  let kunjunganHariIni = 0;
  let pengunjungTerdaftar = 0;
  let pengunjungAnonim = 0;
  let siswaDanGuru = 0;
  let tamuUmum = 0;

  const articleCountMap: Record<string, number> = {};
  const pageCountMap: Record<string, { path: string; title: string; count: number }> = {};
  const deviceCountMap: Record<string, number> = {};

  for (const v of visitors) {
    if (isTodayWib(v.startTime)) {
      kunjunganHariIni++;
    }

    if (v.guestId || v.guestName) {
      pengunjungTerdaftar++;
      const s = (v.guestStatus || "").toLowerCase();
      if (s.includes("siswa") || s.includes("guru") || s.includes("kepala sekolah")) {
        siswaDanGuru++;
      } else {
        tamuUmum++;
      }
    } else {
      pengunjungAnonim++;
    }

    if (v.device) {
      deviceCountMap[v.device] = (deviceCountMap[v.device] || 0) + 1;
    }
  }

  for (const act of activities) {
    if (act.type === "article_view" || act.type === "article_read") {
      const artName = act.details || act.title;
      articleCountMap[artName] = (articleCountMap[artName] || 0) + 1;
    }

    const key = act.path || "/";
    if (!pageCountMap[key]) {
      pageCountMap[key] = { path: key, title: act.title, count: 0 };
    }
    pageCountMap[key].count++;
  }

  const artikelTerpopuler = Object.entries(articleCountMap)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const halamanTerpopuler = Object.values(pageCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const perangkatTerbanyak = Object.entries(deviceCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalKunjungan: visitors.length,
    kunjunganHariIni,
    pengunjungTerdaftar,
    pengunjungAnonim,
    siswaDanGuru,
    tamuUmum,
    artikelTerpopuler,
    halamanTerpopuler,
    perangkatTerbanyak,
  };
}

/**
 * Hapus satu sesi pengunjung berdasarkan ID (Konfirmasi Admin)
 */
export function deleteVisitor(sessionId: string): boolean {
  if (!isBrowser()) return false;
  const visitors = getStoredVisitors().filter((v) => v.id !== sessionId);
  saveStoredVisitors(visitors);

  // Hapus juga aktivitas terkait
  const activities = getStoredActivities().filter((a) => a.sessionId !== sessionId);
  saveStoredActivities(activities);

  return true;
}

/**
 * Reset seluruh data Buku Tamu dan Track Record (Konfirmasi Khusus Admin)
 */
export function resetAllData(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.GUESTS);
    localStorage.removeItem(STORAGE_KEYS.VISITORS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    notifyDataUpdated();
  } catch (err) {
    console.error("Gagal mereset data:", err);
  }
}

/**
 * Ekspor seluruh data dalam format JSON Backup
 */
export function exportBackupJson(): string {
  const data = {
    app: "KRIDA WACANA",
    school: "SD Negeri 2 Kemutug Lor, Kec. Baturraden, Banyumas",
    exportedAt: new Date().toISOString(),
    exportedAtWib: formatWib(),
    guests: getStoredGuests(),
    visitors: getStoredVisitors(),
    activities: getStoredActivities(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Impor data dari file backup JSON
 */
export function importBackupJson(jsonString: string): { success: boolean; message: string } {
  if (!isBrowser()) return { success: false, message: "Bukan lingkungan browser." };
  try {
    const data = JSON.parse(jsonString);
    if (!data.guests || !data.visitors) {
      return { success: false, message: "Format file JSON tidak valid untuk Krida Wacana." };
    }

    saveStoredGuests(Array.isArray(data.guests) ? data.guests : []);
    saveStoredVisitors(Array.isArray(data.visitors) ? data.visitors : []);
    if (Array.isArray(data.activities)) {
      saveStoredActivities(data.activities);
    }
    notifyDataUpdated();
    return {
      success: true,
      message: `Berhasil memulihkan ${data.visitors.length} riwayat kunjungan dan ${data.guests.length} buku tamu!`,
    };
  } catch (err: any) {
    return { success: false, message: `Gagal membaca file: ${err?.message || "Kesalahan format"}` };
  }
}

/**
 * Buat file CSV untuk diunduh (Kompatibel dengan Microsoft Excel via UTF-8 BOM)
 */
export function generateVisitorsCsv(): string {
  const visitors = getStoredVisitors();
  const headers = [
    "Nomor Kunjungan",
    "Waktu (WIB)",
    "Nama Pengunjung",
    "Email / Kontak",
    "Status / Peran",
    "Asal Sekolah / Instansi",
    "Aktivitas Terakhir",
    "Halaman / Artikel",
    "Perangkat & Browser",
    "Durasi Kunjungan",
    "Kategori Pengunjung",
  ];

  // Helper escape CSV
  const escapeCell = (val?: string | number | null) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = visitors.map((v, idx) => {
    const no = `#${v.sessionNumber || visitors.length - idx}`;
    const waktu = v.startTimeWib || formatWib(v.startTime);
    const nama = v.guestName || "Pengunjung Anonim";
    const kontak = v.guestContact || "-";
    const status = v.guestStatus || "Tamu Umum";
    const instansi = v.guestInstansi || "SDN 2 Kemutug Lor";
    const aktivitas = v.lastActivity || "Membuka Beranda";
    const halaman = v.lastPageOrArticle || "Beranda";
    const perangkat = v.device || "Browser";
    const durasi = formatDuration(v.durationSeconds);
    const kategori = v.guestId ? "Terdaftar (Buku Tamu)" : "Pengunjung Anonim";

    return [
      escapeCell(no),
      escapeCell(waktu),
      escapeCell(nama),
      escapeCell(kontak),
      escapeCell(status),
      escapeCell(instansi),
      escapeCell(aktivitas),
      escapeCell(halaman),
      escapeCell(perangkat),
      escapeCell(durasi),
      escapeCell(kategori),
    ].join(",");
  });

  // Tambahkan UTF-8 BOM agar Excel menampilkan aksen huruf dengan benar
  return "\uFEFF" + [headers.map(escapeCell).join(","), ...rows].join("\r\n");
}

