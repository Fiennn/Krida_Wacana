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
12. [Catatan produksi](#catatan-produksi)

---

## Fitur

**Publik (tanpa login)**

- Beranda dengan hero sekolah, statistik nyata (artikel, kategori, penulis,
  total dibaca), dan daftar artikel terpopuler.
- Daftar artikel, halaman kategori, halaman tag, halaman penulis, dan pencarian.
- Halaman artikel: cover, isi artikel, tag, komentar, tombol suka, tombol simpan,
  dan tombol ikuti penulis.
- SEO: metadata per halaman, Open Graph, favicon, dan judul tab sesuai sekolah.

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

| Variabel               | Wajib | Keterangan                                             |
| ---------------------- | :---: | ------------------------------------------------------ |
| `DATABASE_URL`         |  ya   | `file:./dev.db` untuk development (SQLite)             |
| `AUTH_SECRET`          |  ya   | String acak minimal 32 karakter                        |
| `AUTH_URL`             |  ya   | `http://localhost:3000` saat development               |
| `AUTH_TRUST_HOST`      |  ya   | `true`                                                 |
| `GOOGLE_CLIENT_ID`     | tidak | Kosong/placeholder: login Google dinonaktifkan otomatis |
| `GOOGLE_CLIENT_SECRET` | tidak | Pasangan dari `GOOGLE_CLIENT_ID`                       |

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
# Terapkan migrasi
npm run db:migrate

# Isi data awal (7 kategori, 2 artikel sekolah, akun contoh)
npm run db:seed

# Reset total database development lalu seed ulang
npx prisma migrate reset --force
```

Seed bersifat *idempotent* untuk konten: komentar, suka, simpanan, follow,
tag, artikel, dan kategori lama dihapus lalu dibuat ulang. Data pengguna
tidak dihapus (akun seed diperbarui lewat `upsert`).

Lihat data dengan `npm run db:studio`.

## Menjalankan aplikasi

```bash
# Development
npm run dev            # http://localhost:3000

# Produksi lokal
npm run build
npm start
```

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
```

## Catatan produksi

- Ganti `DATABASE_URL` ke PostgreSQL bila diperlukan, lalu jalankan
  `npx prisma migrate deploy`.
- Isi `AUTH_URL` dengan domain final (HTTPS) dan `AUTH_SECRET` yang kuat.
- Folder `public/uploads/` harus dapat ditulis oleh proses server
  (atau gunakan object storage untuk deployment serverless).
- Jangan commit `.env`, `prisma/dev.db`, dan isi `public/uploads/`.
