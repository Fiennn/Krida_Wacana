/**
 * SEED DATA KRIDA WACANA — SD NEGERI 2 KEMUTUG LOR
 * -------------------------------------------------
 * Isi seed:
 * - 7 kategori: Profil Sekolah, Kegiatan Sekolah, Prestasi, Pembelajaran,
 *   Ekstrakurikuler, Pengumuman, Karya Siswa.
 * - 1 akun admin: "Admin SDN 2 Kemutug Lor".
 * - 2 akun demo (guru penulis & pembaca).
 * - 2 artikel sekolah (PUBLISHED) dengan cover gradien navy.
 *
 * Jalankan: npm run db:seed
 * (Disarankan setelah `npx prisma migrate reset --force`.)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Escape karakter khusus agar SVG valid. */
function esc(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Cover placeholder: gradien navy + judul artikel (bisa diganti foto asli). */
async function makeCover(fileName: string, judulBaris1: string, judulBaris2: string) {
  const dir = path.join(process.cwd(), "public", "uploads", "seed");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, fileName);

  const svg = Buffer.from(`
    <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1E3A8A"/>
          <stop offset="55%" stop-color="#0B1F4B"/>
          <stop offset="100%" stop-color="#07142F"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#g)"/>
      <circle cx="1040" cy="110" r="260" fill="#ffffff" opacity="0.05"/>
      <circle cx="160" cy="600" r="200" fill="#FBBF24" opacity="0.10"/>
      <rect x="80" y="150" width="90" height="8" rx="4" fill="#FBBF24"/>
      <text x="80" y="215" font-family="Arial, sans-serif" font-size="22" letter-spacing="8" fill="#FBBF24">SD NEGERI 2 KEMUTUG LOR</text>
      <text x="80" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="bold" fill="#ffffff">${esc(judulBaris1)}</text>
      <text x="80" y="410" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="bold" fill="#ffffff">${esc(judulBaris2)}</text>
      <text x="80" y="585" font-family="Arial, sans-serif" font-size="20" letter-spacing="6" fill="#ffffff" opacity="0.55">KRIDA WACANA · PORTAL ARTIKEL SEKOLAH</text>
      <text x="1040" y="585" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#ffffff" opacity="0.25">KW</text>
    </svg>
  `);

  await sharp(svg).png().toFile(filePath);
  return `/uploads/seed/${fileName}`;
}

/** Bersihkan konten lama agar seed bisa dijalankan berulang. */
async function resetKonten() {
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();

  // Hapus cover seed lama, sisakan hanya cover baru
  const dir = path.join(process.cwd(), "public", "uploads", "seed");
  const simpan = new Set(["cover-profil-sekolah.png", "cover-kegiatan-sekolah.png"]);
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith("cover-") && file.endsWith(".png") && !simpan.has(file)) {
        fs.unlinkSync(path.join(dir, file));
      }
    }
  }
}

async function main() {
  console.log("🌱 Mulai seeding Krida Wacana — SD Negeri 2 Kemutug Lor…");
  await resetKonten();

  // ============================================================
  // 1. Kategori (7)
  // ============================================================
  const categoriesData = [
    { name: "Profil Sekolah", description: "Mengenal SD Negeri 2 Kemutug Lor: lokasi, visi, dan lingkungan belajar." },
    { name: "Kegiatan Sekolah", description: "Kabar kegiatan belajar, upacara, dan keseharian warga sekolah." },
    { name: "Prestasi", description: "Capaian dan prestasi siswa maupun sekolah." },
    { name: "Pembelajaran", description: "Catatan pembelajaran, metode, dan materi di kelas." },
    { name: "Ekstrakurikuler", description: "Kegiatan pengembangan bakat dan minat siswa." },
    { name: "Pengumuman", description: "Informasi resmi sekolah untuk siswa, orang tua, dan warga sekolah." },
    { name: "Karya Siswa", description: "Tulisan, gambar, dan karya siswa SD Negeri 2 Kemutug Lor." },
  ];
  for (const c of categoriesData) {
    await prisma.category.create({
      data: { name: c.name, slug: slugify(c.name), description: c.description },
    });
  }
  const allCategories = await prisma.category.findMany();
  const kategoriMap = new Map(allCategories.map((c) => [c.name, c]));
  console.log(`✅ ${categoriesData.length} kategori siap`);

  // ============================================================
  // 2. Akun admin sekolah
  // ============================================================
  const adminEmail = "admin@kridawacana.id";
  const adminPassword = "admin1234";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin SDN 2 Kemutug Lor",
      role: "ADMIN",
      bio: "Pengelola portal artikel SD Negeri 2 Kemutug Lor, Kec. Baturraden, Kab. Banyumas.",
    },
    create: {
      name: "Admin SDN 2 Kemutug Lor",
      email: adminEmail,
      username: "admin",
      hashedPassword: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      bio: "Pengelola portal artikel SD Negeri 2 Kemutug Lor, Kec. Baturraden, Kab. Banyumas.",
    },
  });
  console.log(`✅ Admin: ${adminEmail} / ${adminPassword}`);

  // ============================================================
  // 3. Akun demo (guru penulis & pembaca)
  // ============================================================
  const demoHash = await bcrypt.hash("penulis123", 12);
  const nadia = await prisma.user.upsert({
    where: { email: "nadia@example.com" },
    update: { role: "PENULIS" },
    create: {
      name: "Nadia Rahma",
      email: "nadia@example.com",
      username: "nadiawrites",
      hashedPassword: demoHash,
      role: "PENULIS",
      bio: "Guru di SD Negeri 2 Kemutug Lor. Menulis catatan kegiatan dan pembelajaran sekolah.",
    },
  });
  const bima = await prisma.user.upsert({
    where: { email: "bima@example.com" },
    update: { role: "READER" },
    create: {
      name: "Bima Aditya",
      email: "bima@example.com",
      username: "bimajalan",
      hashedPassword: demoHash,
      role: "READER",
      bio: "Warga Baturraden yang senang membaca kabar kegiatan sekolah.",
    },
  });
  console.log("✅ Akun demo siap (password: penulis123)");

  // ============================================================
  // 4. Artikel sekolah (2)
  // ============================================================
  const artikelData = [
    {
      title: "Profil SD Negeri 2 Kemutug Lor: Sekolah di Lereng Gunung Slamet",
      excerpt:
        "Mengenal SD Negeri 2 Kemutug Lor di Kec. Baturraden, Kab. Banyumas — sekolah yang tumbuh di kaki Gunung Slamet dengan suasana belajar asri dan ramah anak.",
      kategori: "Profil Sekolah",
      daysAgo: 2,
      views: 0,
      cover: ["cover-profil-sekolah.png", "Profil Sekolah", "di Lereng Slamet"],
      tags: ["Profil Sekolah", "Baturraden", "Banyumas"],
      content: [
        "<p>SD Negeri 2 Kemutug Lor adalah sekolah dasar negeri yang berada di wilayah Kecamatan Baturraden, Kabupaten Banyumas, Jawa Tengah. Sekolah ini menjadi tempat anak-anak sekitar menimba ilmu setiap hari, dengan suasana khas desa di lereng Gunung Slamet.</p>",
        "<h2>Lokasi dan Lingkungan Belajar</h2>",
        "<p>Berada di kawasan Baturraden, sekolah dikelilingi lingkungan yang sejuk dan asri. Udara pegunungan, pepohonan, dan pemandangan perbukitan menjadi latar keseharian siswa saat datang dan pulang sekolah.</p>",
        "<p>Lingkungan seperti ini dimanfaatkan warga sekolah untuk belajar di luar kelas. Siswa dapat mengenal tanaman, menjaga kebersihan, dan belajar mencintai alam sekitar sebagai bagian dari pendidikan karakter.</p>",
        "<h2>Semangat Belajar Warga Sekolah</h2>",
        "<p>Setiap pagi siswa datang dengan seragam rapi, menyapa guru, lalu bersiap mengikuti pembelajaran. Guru mendampingi siswa dengan pendekatan yang hangat agar anak-anak merasa aman dan nyaman belajar.</p>",
        "<p>[ISI DATA: jumlah siswa dan guru] dapat ditambahkan di bagian ini agar profil sekolah makin lengkap. Data resmi sebaiknya diambil dari administrasi sekolah.</p>",
        "<blockquote><p>Sekolah yang baik bukan hanya tempat belajar, tetapi juga rumah kedua tempat anak tumbuh dengan gembira.</p></blockquote>",
        "<h2>Visi Sekolah yang Ramah Anak</h2>",
        "<p>SD Negeri 2 Kemutug Lor berkomitmen menjadi sekolah yang ramah anak. [ISI DATA: visi dan misi resmi sekolah] dapat dilengkapi oleh admin agar sesuai dengan dokumen sekolah.</p>",
        "<p>Melalui kebiasaan saling menghormati, gotong royong, dan menjaga kebersihan, warga sekolah berupaya menciptakan lingkungan belajar yang aman, nyaman, dan menyenangkan bagi semua siswa.</p>",
      ].join("\n"),
    },
    {
      title: "Kegiatan Belajar dan Keseharian Siswa SD Negeri 2 Kemutug Lor",
      excerpt:
        "Dari upacara pagi hingga kegiatan ekstrakurikuler, begini gambaran keseharian siswa SD Negeri 2 Kemutug Lor di Baturraden.",
      kategori: "Kegiatan Sekolah",
      daysAgo: 1,
      views: 0,
      cover: ["cover-kegiatan-sekolah.png", "Kegiatan Belajar", "dan Keseharian"],
      tags: ["Kegiatan Sekolah", "Keseharian Siswa", "Ekstrakurikuler"],
      content: [
        "<p>Keseharian di SD Negeri 2 Kemutug Lor dimulai sejak pagi. Siswa berdatangan ke sekolah, sebagian berjalan kaki dan sebagian diantar keluarga, lalu berkumpul di halaman sebelum kegiatan belajar dimulai.</p>",
        "<h2>Pagi di Sekolah: Upacara dan Pembiasaan</h2>",
        "<p>Pada hari tertentu, siswa mengikuti upacara bendera di halaman sekolah. Selain upacara, ada pembiasaan pagi seperti berdoa, menyanyikan lagu Indonesia Raya, dan merapikan kelas sebelum pelajaran pertama.</p>",
        "<p>[ISI DATA: jadwal upacara dan pembiasaan pagi] dapat ditambahkan agar informasi sesuai dengan kebiasaan resmi sekolah.</p>",
        "<h2>Pembelajaran di Kelas</h2>",
        "<p>Di dalam kelas, guru menyampaikan materi dengan berbagai cara: ceramah singkat, tanya jawab, kerja kelompok, hingga praktik sederhana. Siswa diajak aktif bertanya dan mencoba sendiri agar pembelajaran terasa bermakna.</p>",
        "<p>Pelajaran tidak selalu di dalam ruangan. Sesekali siswa belajar di halaman atau memanfaatkan lingkungan sekitar sekolah untuk mengamati tanaman dan benda-benda di sekitar.</p>",
        "<h2>Istirahat dan Kebersamaan</h2>",
        "<p>Saat istirahat, siswa bermain di halaman, bertukar bekal, dan mengobrol dengan teman. Guru tetap mendampingi agar permainan berlangsung aman dan menyenangkan.</p>",
        "<h2>Ekstrakurikuler dan Gotong Royong</h2>",
        "<p>Setelah pelajaran, siswa dapat mengikuti kegiatan ekstrakurikuler sesuai minat. [ISI DATA: jenis ekstrakurikuler yang tersedia] bisa dilengkapi oleh admin sekolah.</p>",
        "<p>Budaya gotong royong juga ditanamkan melalui piket kelas dan kerja bakti membersihkan lingkungan sekolah. Kebiasaan kecil ini melatih tanggung jawab dan kepedulian siswa terhadap tempat belajar mereka.</p>",
      ].join("\n"),
    },
  ];

  for (const d of artikelData) {
    const category = kategoriMap.get(d.kategori)!;
    const slug = slugify(d.title);
    const cover = await makeCover(d.cover[0], d.cover[1], d.cover[2]);
    const publishedAt = new Date(Date.now() - d.daysAgo * 86_400_000);

    await prisma.article.create({
      data: {
        title: d.title,
        slug,
        excerpt: d.excerpt,
        content: d.content,
        coverImage: cover,
        status: "PUBLISHED",
        views: d.views,
        readMinutes: readingTime(d.content),
        categoryId: category.id,
        authorId: admin.id,
        publishedAt,
      },
    });
  }
  const allArticles = await prisma.article.findMany({ orderBy: { publishedAt: "desc" } });
  console.log(`✅ ${allArticles.length} artikel sekolah tersimpan`);

  // ============================================================
  // 5. Tag & relasi artikel-tag (2–3 tag per artikel)
  // ============================================================
  const tagNames = ["Profil Sekolah", "Baturraden", "Banyumas", "Kegiatan Sekolah", "Keseharian Siswa", "Ekstrakurikuler"];
  for (const name of tagNames) {
    await prisma.tag.create({ data: { name, slug: slugify(name) } });
  }
  const allTags = await prisma.tag.findMany();
  const tagMap = new Map(allTags.map((t) => [t.name, t]));

  for (let i = 0; i < artikelData.length; i++) {
    const article = allArticles.find((a) => a.slug === slugify(artikelData[i].title))!;
    for (const tagName of artikelData[i].tags) {
      const tag = tagMap.get(tagName);
      if (tag) {
        await prisma.articleTag.create({
          data: { articleId: article.id, tagId: tag.id },
        });
      }
    }
  }
  console.log("✅ Tag & relasi artikel-tag siap");

  // ============================================================
  // 6. Contoh interaksi (like, bookmark, follow, komentar)
  // ============================================================
  for (const article of allArticles) {
    await prisma.like.create({ data: { userId: nadia.id, articleId: article.id } });
    await prisma.like.create({ data: { userId: bima.id, articleId: article.id } });
  }
  await prisma.follow.create({
    data: { followerId: bima.id, followingId: nadia.id },
  });

  const artikelKegiatan = allArticles.find(
    (a) => a.slug === slugify(artikelData[1].title),
  );
  if (artikelKegiatan) {
    await prisma.comment.create({
      data: {
        id: "seed-comment-parent",
        content: "Terima kasih sudah berbagi kabar sekolah. Senang membacanya!",
        userId: bima.id,
        articleId: artikelKegiatan.id,
      },
    });
    await prisma.comment.create({
      data: {
        id: "seed-comment-reply",
        content: "Terima kasih kembali. Semoga makin banyak kabar kegiatan yang bisa dibagikan.",
        userId: admin.id,
        articleId: artikelKegiatan.id,
        parentId: "seed-comment-parent",
      },
    });
    await prisma.bookmark.create({
      data: { userId: bima.id, articleId: artikelKegiatan.id },
    });
  }
  console.log("✅ Like, bookmark, follow, komentar contoh siap");

  console.log("\n🎉 Seeding selesai!");
  console.log("[ADMIN]  admin@kridawacana.id / admin1234");
  console.log("[GURU]   nadia@example.com / penulis123 (PENULIS)");
  console.log("[SISWA]  bima@example.com / penulis123 (READER)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
