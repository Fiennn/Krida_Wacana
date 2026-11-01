# Krida Wacana

**Portal artikel dan publikasi resmi SD Negeri 2 Kemutug Lor**
Kec. Baturraden, Kab. Banyumas, Jawa Tengah.

> Tulis. Bagikan. Dibaca Semua Orang.

Krida Wacana adalah situs publikasi sekolah: siapa pun boleh membaca artikel,
sedangkan penulisan hanya untuk akun yang sudah disetujui admin sekolah
(guru/siswa terpilih). Semua konten dikelola dari panel admin.

---

## Daftar Isi

1. [Fitur](#fitur)
2. [Peran pengguna](#peran-pengguna)
3. [Teknologi](#teknologi)
4. [Instalasi](#instalasi)
5. [Konfigurasi environment](#konfigurasi-environment)
6. [Setup Google OAuth](#setup-google-oauth)
7. [Database: migrate dan seed](#database-migrate-dan-seed)
8. [Menjalankan aplikasi](#menjalankan-aplikasi)
9. [Akun hasil seed](#akun-hasil-seed)
10. [Mengganti logo sekolah](#mengganti-logo-sekolah)
11. [Struktur folder penting](#struktur-folder-penting)
12. [Deploy ke Vercel](#deploy-ke-vercel)

---

## Fitur

**Publik (tanpa login)**

- Beranda dengan hero sekolah, statistik nyata (artikel, kategori, penulis,
  total dibaca), dan daftar artikel terpopuler.
- Daftar artikel, halaman kategori, halaman tag, halaman penulis, dan pencarian.
- Halaman artikel: cover, isi artikel, tag, komentar, tombol suka, tombol simpan,
  dan tombol ikuti penulis.
- SEO: metadata per halaman, Open Graph, favicon, dan judul tab sesuai sekolah.
- **Buku Tamu Pengunjung**: Pengunjung dapat mengisi jejak kunjungan (Nama, Status/Peran, Asal Instansi, Keperluan, Kontak) melalui tombol melayang (floating action) atau bar atas.
- **Tracking Aktivitas Otomatis**: Pelacakan otomatis aktivitas membuka halaman, membaca artikel, mencari artikel, dan membagikan artikel secara aman.

**Buku Tamu & Track Record Pengunjung (Khusus Admin)**

- Dashboard resmi `/admin/track-record` (diakses lewat panel admin atau menu akun admin).
- 4 Kartu Statistik Asli: Total Kunjungan, Kunjungan Hari Ini (WIB), Pengunjung Terdaftar, dan Pengunjung Anonim.
- Tabel riwayat kunjungan lengkap dengan waktu WIB, identitas pengunjung, aktivitas terakhir, perangkat/browser, dan durasi kunjungan.
- Filter real-time: Semua Kunjungan, Hari Ini, Pengunjung Terdaftar, Pengunjung Anonim, Siswa & Guru, Tamu Umum.
- Pencarian real-time pada nama, kontak, instansi, aktivitas, dan perangkat.
- Ekspor data riwayat ke format Excel / CSV (UTF-8 BOM).
- Pratinjau dan cetak laporan formal A4 resmi untuk evaluasi literasi & akreditasi sekolah SDN 2 Kemutug Lor.
- Fitur pencadangan: Backup JSON, Pulihkan JSON, dan Reset Data.

**Akun**

- Masuk dengan Google atau email + password.
- Profil pengguna dan daftar artikel tersimpan.
- Notifikasi status: akun baru otomatis berstatus **Pembaca**.

**Penulis (guru/siswa yang disetujui admin)**

- Editor artikel (Tiptap) dengan judul, kategori, tag, ringkasan, cover,
  unggah gambar (diproses dengan sharp), simpan sebagai draf, dan terbitkan.
- Dashboard "Tulisan Saya": statistik dibaca/suka/komentar, edit, dan hapus.

**Admin**

- `/admin` ringkasan situs.
- `/admin/artikel` moderasi: terbitkan, tarik ke draf, hapus.
- `/admin/komentar` moderasi: sembunyikan/tampilkan, hapus.
- `/admin/kategori` tambah, ubah nama, hapus kategori.
- `/admin/pengguna` ubah peran: Pembaca, Penulis, atau Admin.

## Peran pengguna

| Peran     | Baca | Suka/Simpan/Komentar | Tulis artikel | Panel admin |
| --------- | :--: | :------------------: | :-----------: | :---------: |
| `READER`  |  ya  |          ya          |    tidak      |   tidak     |
| `PENULIS` |  ya  |          ya          |      ya       |   tidak     |
| `ADMIN`   |  ya  |          ya          |      ya       |     ya      |

- Akun baru (termasuk pendaftaran lewat Google) selalu dibuat sebagai `READER`.
- Admin menaikkan peran menjadi `PENULIS` lewat `/admin/pengguna`.
- Guard berlapis: middleware (`lib/auth.config.ts`), halaman (`/tulis`, `/admin`),
  dan API (`POST /api/artikel` mengembalikan `403` untuk pembaca).

## Teknologi

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS (tema navy, kuning, glassmorphism)
- Auth.js / NextAuth v5 (Google + Credentials, strategi JWT)
- Prisma ORM + SQLite (development)
- Tiptap (editor teks kaya), sanitize-html, sharp (gambar)

## Instalasi

Prasyarat: Node.js 20+ dan npm.

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Isi `.env` (lihat bagian berikut), lalu siapkan database dan jalankan.

## Konfigurasi environment

| Variabel                | Wajib | Keterangan                                                       |
| ----------------------- | :---: | ---------------------------------------------------------------- |
| `DATABASE_URL`          |  ya   | Connection string PostgreSQL (Neon). Lihat bagian Deploy ke Vercel |
| `AUTH_SECRET`           |  ya   | String acak minimal 32 karakter                                  |
| `AUTH_URL`              |  ya   | `http://localhost:3000` saat development                         |
| `AUTH_TRUST_HOST`       |  ya   | `true`                                                           |
| `BLOB_READ_WRITE_TOKEN` | tidak | Token Vercel Blob. Kosong = gambar disimpan ke `public/uploads` (lokal) |
| `GOOGLE_CLIENT_ID`      | tidak | Kosong/placeholder: login Google dinonaktifkan otomatis           |
| `GOOGLE_CLIENT_SECRET`  | tidak | Pasangan dari `GOOGLE_CLIENT_ID`                                 |

Aplikasi ini **memakai PostgreSQL** (bukan SQLite), baik untuk development
maupun produksi. Database gratis bisa dibuat di [Neon](https://neon.tech) —
satu database yang sama dapat dipakai untuk lokal dan Vercel.

Membuat `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Selama Google OAuth belum dikonfigurasi, halaman `/masuk` menampilkan kartu
"login Google belum aktif" dan pengguna tetap bisa masuk dengan email + password.

## Setup Google OAuth

1. Buka <https://console.cloud.google.com/apis/credentials>.
2. Buat project baru (mis. `Krida Wacana`).
3. Konfigurasi **OAuth consent screen** (tipe *External*, isi nama aplikasi,
   email dukungan, dan domain).
4. Buat **OAuth client ID** dengan tipe *Web application*.
5. Tambahkan **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://domain-sekolah-anda.sch.id` (produksi)
6. Tambahkan **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://domain-sekolah-anda.sch.id/api/auth/callback/google`
7. Salin *Client ID* dan *Client Secret* ke `.env`:

   ```env
   GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="xxxx"
   ```

8. Restart server. Tombol **Masuk dengan Google** akan aktif.

Pengguna yang mendaftar lewat Google otomatis berperan `READER`; admin perlu
menaikkan peran lewat `/admin/pengguna` bila ingin memberi izin menulis.

## Database: migrate dan seed

```bash
# Development: buat/perbarui migrasi dari perubahan schema
npm run db:migrate

# Produksi (Vercel / Neon): terapkan migrasi yang sudah ada, tanpa prompt
npm run db:deploy

# Isi data awal (7 kategori, 2 artikel sekolah, akun contoh)
npm run db:seed

# Reset total database development lalu seed ulang
npx prisma migrate reset --force
```

Seed bersifat *idempotent* untuk konten: komentar, suka, simpanan, follow,
tag, artikel, dan kategori lama dihapus lalu dibuat ulang. Data pengguna
tidak dihapus (akun seed diperbarui lewat `upsert`).

> **Hati-hati:** `db:seed` menghapus seluruh artikel dan kategori sebelum
> membuat ulang data contoh. Jangan dijalankan pada database produksi yang
> sudah berisi artikel asli sekolah.

Lihat data dengan `npm run db:studio`.

## Menjalankan aplikasi

```bash
# Development
npm run dev            # http://localhost:3000

# Produksi lokal
npm run build
npm start
```

> `npm run build` dan `npm start` memerlukan `DATABASE_URL` yang valid.
> Gambar yang diunggah saat `npm start` disimpan ke `public/uploads`, tetapi
> Next.js hanya menyajikan file `public/` yang sudah ada saat build — jadi
> untuk mencoba unggah gambar gunakan `npm run dev`, atau isi
> `BLOB_READ_WRITE_TOKEN` agar memakai Vercel Blob.

## Akun hasil seed

| Peran     | Email                    | Password     |
| --------- | ------------------------ | ------------ |
| `ADMIN`   | `admin@kridawacana.id`   | `admin1234`  |
| `PENULIS` | `reni@example.com`       | `penulis123` |
| `READER`  | `bima@example.com`       | `penulis123` |

> Ganti password akun admin sebelum dipakai di lingkungan nyata.

## Mengganti logo sekolah

Saat ini ketiga logo masih berupa **placeholder** (kotak abu-abu bertuliskan
nama logo). Ganti dengan file resmi, nama file dan lokasi harus sama:

| File                                  | Dipakai untuk                                     |
| ------------------------------------- | ------------------------------------------------- |
| `public/logo/tut-wuri-handayani.png`  | Logo Tut Wuri Handayani di header/footer          |
| `public/logo/sdn2-kemutug-lor.png`    | Logo SD Negeri 2 Kemutug Lor (header, watermark)  |
| `public/logo/krida-wacana.png`        | Logo Krida Wacana (header, favicon, og:image)     |

Ketentuan gambar:

- Format PNG dengan latar transparan (kecuali logo Krida Wacana yang bulat).
- Ukuran disarankan 512 x 512 piksel, rasio 1:1.
- Logo Krida Wacana juga dipakai sebagai favicon dan `og:image`, jadi
  gunakan versi bulat tanpa teks kecil agar tetap terbaca di ukuran kecil.

Setelah mengganti `krida-wacana.png`, perbarui juga favicon:

```bash
copy public\logo\krida-wacana.png app\icon.png
```

Untuk membuat ulang placeholder (jika file terhapus):

```bash
node scripts/generate-logo-placeholders.mjs
```

## Struktur folder penting

```
app/
  page.tsx                 Beranda (hero sekolah, statistik, artikel)
  artikel/[slug]/          Halaman baca artikel
  kategori/, tag/, penulis/ Halaman daftar per kategori/tag/penulis
  cari/                    Pencarian
  masuk/, daftar/          Autentikasi
  tulis/                   Editor artikel (PENULIS/ADMIN)
  dashboard/, tersimpan/, profil/
  admin/                   Panel admin (ADMIN)
  api/                     API artikel, komentar, like, bookmark, follow, upload
components/
  brand/BrandLogo.tsx      Logo + nama situs (header, footer, halaman auth)
  layout/                  Header, footer, menu pengguna
  article/                 Kartu artikel, komentar, tombol suka/simpan
  editor/                  Editor Tiptap
  admin/                   Form kategori, tombol konfirmasi
lib/
  constants.ts             Identitas sekolah, navigasi, nama file logo
  auth.ts / auth.config.ts Konfigurasi Auth.js (config edge-safe di auth.config)
  queries.ts               Query publik
prisma/
  schema.prisma            Skema database (role default READER)
  seed.ts                  Data awal sekolah
public/logo/               Tiga file logo (ganti dengan logo resmi)
public/covers/             Cover contoh untuk 2 artikel seed
```

## Deploy ke Vercel

Aplikasi ini memakai **PostgreSQL** dan **Vercel Blob**, karena filesystem di
Vercel bersifat sementara/read-only (SQLite dan folder `public/uploads` tidak
bisa dipakai di sana).

### 1. Siapkan database (Neon, gratis)

1. Buka <https://neon.tech> lalu daftar/masuk.
2. **Create project** → pilih region terdekat (mis. *Singapore*).
3. Salin **connection string**. Pakai yang **langsung / direct** (nama host
   tanpa `-pooler`), bentuknya:

   ```env
   DATABASE_URL="postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```

   Connection string yang mengandung `-pooler` bisa membuat
   `prisma migrate deploy` gagal saat build.

### 2. Siapkan penyimpanan gambar (Vercel Blob)

1. Buka dashboard Vercel → project Anda → tab **Storage**.
2. **Create Database / Store** → pilih **Blob** → Create.
3. Salin **`BLOB_READ_WRITE_TOKEN`** (otomatis ditambahkan ke project bila
   Blob dibuat dari dashboard project yang sama).

### 3. Isi Environment Variables di Vercel

Project → **Settings** → **Environment Variables** (Production + Preview):

| Nama                    | Nilai                                                        |
| ----------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`          | connection string Neon (direct, lihat langkah 1)             |
| `AUTH_SECRET`           | string acak ≥ 32 karakter                                    |
| `AUTH_URL`              | `https://krida-wacana.vercel.app` (domain final Anda)        |
| `AUTH_TRUST_HOST`       | `true`                                                       |
| `BLOB_READ_WRITE_TOKEN` | token dari langkah 2                                         |
| `GOOGLE_CLIENT_ID`      | opsional (lihat Setup Google OAuth)                          |
| `GOOGLE_CLIENT_SECRET`  | opsional                                                     |

`DATABASE_URL` **wajib** diisi. Tanpa variabel ini aplikasi akan gagal
dengan error "Environment variable not found: DATABASE_URL".

### 4. Deploy

Vercel otomatis menjalankan script `vercel-build`, yaitu:

```bash
prisma generate && prisma migrate deploy && next build
```

Jadi tabel database dibuat/diperbarui otomatis setiap deploy.

Bila deploy pertama masih kosong datanya, isi data awal sekali dari komputer
Anda (mengarah ke database Neon yang sama):

```bash
# pastikan .env berisi DATABASE_URL Neon, lalu:
npm run db:deploy
npm run db:seed
```

> `db:seed` menghapus artikel & kategori yang ada. Hanya jalankan sekali di
> awal, sebelum artikel asli sekolah dibuat.

### 5. Google OAuth (bila dipakai)

Tambahkan URL produksi di Google Cloud Console:

- Authorized JavaScript origin: `https://krida-wacana.vercel.app`
- Authorized redirect URI:
  `https://krida-wacana.vercel.app/api/auth/callback/google`

### Checklist bila muncul "Application error"

1. Pastikan `DATABASE_URL` sudah diisi di Vercel (Settings → Environment Variables).
2. Pastikan connection string memakai host **direct** (tanpa `-pooler`).
3. Buka **Deployments → (deployment terbaru) → Functions/Logs** untuk melihat
   pesan error aslinya, lalu **Redeploy** setelah env diubah (env baru hanya
   terbaca pada deployment berikutnya).
4. Pastikan `AUTH_URL` sama dengan domain yang dipakai (https, tanpa garis
   miring di akhir).

> Jangan pernah menulis connection string atau token langsung di dalam kode.
> Simpan hanya di `.env` (lokal, sudah di-*gitignore*) dan di dashboard Vercel.


---

## Arsitektur Buku Tamu & Track Record (Stand-alone LocalStorage)

Fitur Buku Tamu dan Track Record Pengunjung di Krida Wacana diimplementasikan secara mandiri menggunakan JavaScript Browser API (`localStorage` & `sessionStorage`) tanpa bergantung pada server database eksternal:

### 1. Struktur Penyimpanan
- `krida_wacana_guests`: Menyimpan entri formulir Buku Tamu resmi yang diisi pengunjung.
- `krida_wacana_visitors`: Menyimpan riwayat sesi kunjungan unik (nomor urut, waktu WIB, durasi, perangkat, OS, browser, identitas).
- `krida_wacana_activities`: Mencatat log kronologis aktivitas navigasi, membaca artikel, pencarian, dan pembagian artikel.
- `krida_wacana_session_id`: Disimpan pada `sessionStorage` untuk mengelompokkan aktivitas satu sesi kunjungan dan mencegah duplikasi hitungan akibat refresh halaman.
- `krida_wacana_visitor_id`: Disimpan pada `localStorage` sebagai identifier perangkat pengunjung.

### 2. Keterbatasan & Mekanisme Pencadangan (PENTING)
> **Perhatian:**
> Karena sistem ini tidak menggunakan database cloud terpusat, `localStorage` menyimpan data pada browser dan perangkat tempat data tersebut dibuat.
> Data kunjungan dari perangkat pengunjung lain tidak otomatis terkirim ke dashboard admin di komputer yang berbeda.
> 
> Untuk memindahkan data antar perangkat atau melakukan arsip administrasi, gunakan fitur:
> 1. **Ekspor Excel / CSV**: Mengunduh seluruh riwayat kunjungan dalam format spreadsheet.
> 2. **Backup JSON**: Mengunduh salinan berkas cadangan data terstruktur.
> 3. **Pulihkan JSON**: Mengimpor berkas cadangan JSON dari perangkat lain ke dashboard admin.
> 4. **Cetak Rekap A4**: Mencetak lembar laporan formal bertanda tangan resmi Kepala Sekolah dan Administrator Krida Wacana.

