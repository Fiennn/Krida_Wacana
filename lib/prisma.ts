/**
 * ============================================================
 * KRIDA WACANA — IN-MEMORY MOCK STORE (DATABASE-FREE MODE)
 * ============================================================
 * Menggantikan Prisma Client dengan in-memory data store mandiri.
 * Website dapat berjalan, dibuild, dan dideploy ke Vercel/Netlify
 * tanpa memerlukan server database eksternal (PostgreSQL / Neon)
 * ataupun generate binary Prisma engine.
 * ============================================================
 */

export type UserRole = "ADMIN" | "PENULIS" | "READER";

export interface MockUser {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  hashedPassword: string | null;
  role: UserRole;
  username: string;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface MockTag {
  id: string;
  name: string;
  slug: string;
}

export interface MockArticleTag {
  articleId: string;
  tagId: string;
}

export interface MockArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  views: number;
  readMinutes: number;
  authorId: string;
  categoryId: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockComment {
  id: string;
  content: string;
  parentId: string | null;
  userId: string;
  articleId: string;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockLike {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
}

export interface MockBookmark {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
}

export interface MockFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface MockImage {
  id: string;
  url: string;
  articleId: string | null;
  createdAt: Date;
}

// Initial Data
const initialCategories: MockCategory[] = [
  { id: "cat-profil", name: "Profil Sekolah", slug: "profil-sekolah", description: "Mengenal SD Negeri 2 Kemutug Lor: lokasi, visi, dan lingkungan belajar." },
  { id: "cat-kegiatan", name: "Kegiatan Sekolah", slug: "kegiatan-sekolah", description: "Kabar kegiatan belajar, upacara, dan keseharian warga sekolah." },
  { id: "cat-prestasi", name: "Prestasi", slug: "prestasi", description: "Capaian dan prestasi siswa maupun sekolah." },
  { id: "cat-pembelajaran", name: "Pembelajaran", slug: "pembelajaran", description: "Catatan pembelajaran, metode, dan materi di kelas." },
  { id: "cat-ekskul", name: "Ekstrakurikuler", slug: "ekstrakurikuler", description: "Kegiatan pengembangan bakat dan minat siswa." },
  { id: "cat-pengumuman", name: "Pengumuman", slug: "pengumuman", description: "Informasi resmi sekolah untuk siswa, orang tua, dan warga sekolah." },
  { id: "cat-karya", name: "Karya Siswa", slug: "karya-siswa", description: "Tulisan, gambar, dan karya siswa SD Negeri 2 Kemutug Lor." },
];

const initialUsers: MockUser[] = [
  {
    id: "usr-admin",
    name: "Admin SDN 2 Kemutug Lor",
    email: "admin@kridawacana.id",
    emailVerified: new Date(),
    image: null,
    // bcrypt hash of "admin1234"
    hashedPassword: "$2b$10$93aHRXW/7blcCFa2/dacIuKQnQfD1kXO7XtiZKxVcbWFnFAefWKee",
    role: "ADMIN",
    username: "admin",
    bio: "Pengelola portal artikel SD Negeri 2 Kemutug Lor, Kec. Baturraden, Kab. Banyumas.",
    createdAt: new Date("2026-01-01T08:00:00Z"),
    updatedAt: new Date("2026-01-01T08:00:00Z"),
  },
  {
    id: "usr-nadia",
    name: "Nadia Rahma, S.Pd.",
    email: "nadia@example.com",
    emailVerified: new Date(),
    image: null,
    // bcrypt hash of "penulis123"
    hashedPassword: "$2b$10$Y4RfxFW4CJs5Z3smPvQqS.kp7g0R8zSF8jVUwyxpVahty3pkKBotO",
    role: "PENULIS",
    username: "nadiawrites",
    bio: "Guru di SD Negeri 2 Kemutug Lor. Menulis catatan kegiatan dan pembelajaran sekolah.",
    createdAt: new Date("2026-01-02T08:00:00Z"),
    updatedAt: new Date("2026-01-02T08:00:00Z"),
  },
  {
    id: "usr-bima",
    name: "Bima Aditya",
    email: "bima@example.com",
    emailVerified: new Date(),
    image: null,
    // bcrypt hash of "penulis123"
    hashedPassword: "$2b$10$Y4RfxFW4CJs5Z3smPvQqS.kp7g0R8zSF8jVUwyxpVahty3pkKBotO",
    role: "READER",
    username: "bimajalan",
    bio: "Warga Baturraden yang senang membaca kabar kegiatan sekolah.",
    createdAt: new Date("2026-01-03T08:00:00Z"),
    updatedAt: new Date("2026-01-03T08:00:00Z"),
  },
];

const initialTags: MockTag[] = [
  { id: "tag-1", name: "Profil Sekolah", slug: "profil-sekolah" },
  { id: "tag-2", name: "Baturraden", slug: "baturraden" },
  { id: "tag-3", name: "Banyumas", slug: "banyumas" },
  { id: "tag-4", name: "Kegiatan Sekolah", slug: "kegiatan-sekolah" },
  { id: "tag-5", name: "Keseharian Siswa", slug: "keseharian-siswa" },
  { id: "tag-6", name: "Ekstrakurikuler", slug: "ekstrakurikuler" },
  { id: "tag-7", name: "Prestasi Siswa", slug: "prestasi-siswa" },
  { id: "tag-8", name: "Seni & Budaya", slug: "seni-budaya" },
];

const initialArticles: MockArticle[] = [
  {
    id: "art-1",
    title: "Profil SD Negeri 2 Kemutug Lor: Sekolah di Lereng Gunung Slamet",
    slug: "profil-sd-negeri-2-kemutug-lor-sekolah-di-lereng-gunung-slamet",
    excerpt: "Mengenal SD Negeri 2 Kemutug Lor di Kec. Baturraden, Kab. Banyumas — sekolah yang tumbuh di kaki Gunung Slamet dengan suasana belajar asri dan ramah anak.",
    content: `<p>SD Negeri 2 Kemutug Lor adalah sekolah dasar negeri yang berada di wilayah Kecamatan Baturraden, Kabupaten Banyumas, Jawa Tengah. Sekolah ini menjadi tempat anak-anak sekitar menimba ilmu setiap hari, dengan suasana khas desa di lereng Gunung Slamet.</p><h2>Lokasi dan Lingkungan Belajar</h2><p>Berada di kawasan Baturraden, sekolah dikelilingi lingkungan yang sejuk dan asri. Udara pegunungan, pepohonan, dan pemandangan perbukitan menjadi latar keseharian siswa saat datang dan pulang sekolah.</p><p>Lingkungan seperti ini dimanfaatkan warga sekolah untuk belajar di luar kelas. Siswa dapat mengenal tanaman, menjaga kebersihan, dan belajar mencintai alam sekitar sebagai bagian dari pendidikan karakter.</p><h2>Semangat Belajar Warga Sekolah</h2><p>Setiap pagi siswa datang dengan seragam rapi, menyapa guru, lalu bersiap mengikuti pembelajaran. Guru mendampingi siswa dengan pendekatan yang hangat agar anak-anak merasa aman dan nyaman belajar.</p><blockquote><p>Sekolah yang baik bukan hanya tempat belajar, tetapi juga rumah kedua tempat anak tumbuh dengan gembira.</p></blockquote><h2>Visi Sekolah yang Ramah Anak</h2><p>SD Negeri 2 Kemutug Lor berkomitmen menjadi sekolah yang ramah anak. Melalui kebiasaan saling menghormati, gotong royong, dan menjaga kebersihan, warga sekolah berupaya menciptakan lingkungan belajar yang aman, nyaman, dan menyenangkan bagi semua siswa.</p>`,
    coverImage: "/covers/cover-profil-sekolah.png",
    status: "PUBLISHED",
    views: 142,
    readMinutes: 3,
    authorId: "usr-admin",
    categoryId: "cat-profil",
    publishedAt: new Date(Date.now() - 3 * 86_400_000),
    createdAt: new Date(Date.now() - 3 * 86_400_000),
    updatedAt: new Date(Date.now() - 3 * 86_400_000),
  },
  {
    id: "art-2",
    title: "Kegiatan Belajar dan Keseharian Siswa SD Negeri 2 Kemutug Lor",
    slug: "kegiatan-belajar-dan-keseharian-siswa-sd-negeri-2-kemutug-lor",
    excerpt: "Dari upacara pagi hingga kegiatan ekstrakurikuler, begini gambaran keseharian siswa SD Negeri 2 Kemutug Lor di Baturraden.",
    content: `<p>Keseharian di SD Negeri 2 Kemutug Lor dimulai sejak pagi. Siswa berdatangan ke sekolah, sebagian berjalan kaki dan sebagian diantar keluarga, lalu berkumpul di halaman sebelum kegiatan belajar dimulai.</p><h2>Pagi di Sekolah: Upacara dan Pembiasaan</h2><p>Pada hari tertentu, siswa mengikuti upacara bendera di halaman sekolah. Selain upacara, ada pembiasaan pagi seperti berdoa, menyanyikan lagu Indonesia Raya, dan merapikan kelas sebelum pelajaran pertama.</p><h2>Pembelajaran di Kelas</h2><p>Di dalam kelas, guru menyampaikan materi dengan berbagai cara: ceramah singkat, tanya jawab, kerja kelompok, hingga praktik sederhana. Siswa diajak aktif bertanya dan mencoba sendiri agar pembelajaran terasa bermakna.</p><h2>Istirahat dan Kebersamaan</h2><p>Saat istirahat, siswa bermain di halaman, bertukar bekal, dan mengobrol dengan teman. Guru tetap mendampingi agar permainan berlangsung aman dan menyenangkan.</p><h2>Ekstrakurikuler dan Gotong Royong</h2><p>Setelah pelajaran, siswa dapat mengikuti kegiatan ekstrakurikuler sesuai minat seperti Pramuka dan seni. Budaya gotong royong juga ditanamkan melalui piket kelas dan kerja bakti membersihkan lingkungan sekolah.</p>`,
    coverImage: "/covers/cover-kegiatan-sekolah.png",
    status: "PUBLISHED",
    views: 98,
    readMinutes: 2,
    authorId: "usr-nadia",
    categoryId: "cat-kegiatan",
    publishedAt: new Date(Date.now() - 2 * 86_400_000),
    createdAt: new Date(Date.now() - 2 * 86_400_000),
    updatedAt: new Date(Date.now() - 2 * 86_400_000),
  },
  {
    id: "art-3",
    title: "Siswa SDN 2 Kemutug Lor Raih Prestasi Lomba Cerita Bergambar Tingkat Kecamatan",
    slug: "siswa-sdn-2-kemutug-lor-raih-prestasi-lomba-cerita-bergambar",
    excerpt: "Kabar gembira datang dari ajang seleksi Festival dan Lomba Seni Siswa Nasional (FLS2N) tingkat Kecamatan Baturraden.",
    content: `<p>Prestasi membanggakan kembali ditorehkan oleh siswa SD Negeri 2 Kemutug Lor. Dalam ajang seleksi Festival dan Lomba Seni Siswa Nasional (FLS2N) tingkat Kecamatan Baturraden, perwakilan sekolah berhasil meraih Juara 2 pada cabang Lomba Gambar Bercerita.</p><h2>Karya yang Mengangkat Keindahan Alam Baturraden</h2><p>Gambar yang dibuat mengangkat tema kearifan lokal lereng Gunung Slamet, menampilkan suasana sungai yang jernih dan aktivitas warga yang hidup harmonis dengan alam. Karya tersebut mendapat pujian dari dewan juri atas komposisi warna dan pesan moral yang kuat.</p><h2>Apresiasi dari Kepala Sekolah dan Guru</h2><p>Pihak sekolah mengapresiasi kerja keras siswa pembimbing yang telah meluangkan waktu latihan setelah jam pelajaran. Prestasi ini diharapkan dapat memotivasi seluruh siswa untuk terus berani berkarya dan menyalurkan bakat terbaiknya.</p>`,
    coverImage: "/covers/cover-profil-sekolah.png",
    status: "PUBLISHED",
    views: 64,
    readMinutes: 2,
    authorId: "usr-nadia",
    categoryId: "cat-prestasi",
    publishedAt: new Date(Date.now() - 1 * 86_400_000),
    createdAt: new Date(Date.now() - 1 * 86_400_000),
    updatedAt: new Date(Date.now() - 1 * 86_400_000),
  },
];

const initialArticleTags: MockArticleTag[] = [
  { articleId: "art-1", tagId: "tag-1" },
  { articleId: "art-1", tagId: "tag-2" },
  { articleId: "art-1", tagId: "tag-3" },
  { articleId: "art-2", tagId: "tag-4" },
  { articleId: "art-2", tagId: "tag-5" },
  { articleId: "art-2", tagId: "tag-6" },
  { articleId: "art-3", tagId: "tag-7" },
  { articleId: "art-3", tagId: "tag-8" },
];

const initialComments: MockComment[] = [
  {
    id: "com-1",
    content: "Terima kasih sudah berbagi kabar sekolah. Senang membacanya!",
    parentId: null,
    userId: "usr-bima",
    articleId: "art-2",
    hidden: false,
    createdAt: new Date(Date.now() - 3600_000 * 12),
    updatedAt: new Date(Date.now() - 3600_000 * 12),
  },
  {
    id: "com-2",
    content: "Terima kasih kembali! Semoga makin banyak kabar kegiatan yang bisa dibagikan.",
    parentId: "com-1",
    userId: "usr-admin",
    articleId: "art-2",
    hidden: false,
    createdAt: new Date(Date.now() - 3600_000 * 10),
    updatedAt: new Date(Date.now() - 3600_000 * 10),
  },
];

const initialLikes: MockLike[] = [
  { id: "like-1", userId: "usr-bima", articleId: "art-1", createdAt: new Date() },
  { id: "like-2", userId: "usr-nadia", articleId: "art-1", createdAt: new Date() },
  { id: "like-3", userId: "usr-bima", articleId: "art-2", createdAt: new Date() },
];

const initialBookmarks: MockBookmark[] = [
  { id: "bm-1", userId: "usr-bima", articleId: "art-2", createdAt: new Date() },
];

const initialFollows: MockFollow[] = [
  { id: "fol-1", followerId: "usr-bima", followingId: "usr-nadia", createdAt: new Date() },
];

class MemoryStore {
  users: MockUser[] = [...initialUsers];
  categories: MockCategory[] = [...initialCategories];
  tags: MockTag[] = [...initialTags];
  articles: MockArticle[] = [...initialArticles];
  articleTags: MockArticleTag[] = [...initialArticleTags];
  comments: MockComment[] = [...initialComments];
  likes: MockLike[] = [...initialLikes];
  bookmarks: MockBookmark[] = [...initialBookmarks];
  follows: MockFollow[] = [...initialFollows];
  images: MockImage[] = [];

  // Helper to enrich article with author, category, tags, counts
  enrichArticle(a: MockArticle) {
    const author = this.users.find((u) => u.id === a.authorId) ?? {
      id: a.authorId,
      name: "Anonim",
      username: "anonim",
      image: null,
      bio: null,
      createdAt: new Date(),
    };
    const category = this.categories.find((c) => c.id === a.categoryId) ?? {
      id: a.categoryId,
      name: "Umum",
      slug: "umum",
      description: null,
    };
    const tags = this.articleTags
      .filter((at) => at.articleId === a.id)
      .map((at) => ({
        tag: this.tags.find((t) => t.id === at.tagId) ?? { id: at.tagId, name: "Tag", slug: "tag" },
      }));
    const likesCount = this.likes.filter((l) => l.articleId === a.id).length;
    const commentsCount = this.comments.filter((c) => c.articleId === a.id && !c.hidden).length;
    const bookmarksCount = this.bookmarks.filter((b) => b.articleId === a.id).length;
    const images = this.images.filter((img) => img.articleId === a.id);

    return {
      ...a,
      author,
      category,
      tags,
      images,
      _count: {
        likes: likesCount,
        comments: commentsCount,
        bookmarks: bookmarksCount,
      },
    };
  }
}

const globalForStore = globalThis as unknown as {
  __krida_memory_store?: MemoryStore;
};

const store = globalForStore.__krida_memory_store ?? new MemoryStore();
if (process.env.NODE_ENV !== "production") {
  globalForStore.__krida_memory_store = store;
}

// ==============================================================
// PRISMA MOCK IMPLEMENTATION
// ==============================================================

export const prisma = {
  $connect: async () => {},
  $disconnect: async () => {},
  $transaction: async (cbOrArr: unknown) => {
    if (typeof cbOrArr === "function") {
      return cbOrArr(prisma);
    }
    if (Array.isArray(cbOrArr)) {
      return Promise.all(cbOrArr);
    }
    return cbOrArr;
  },

  // ------------------------------------------------------------
  // ARTICLE
  // ------------------------------------------------------------
  article: {
    findMany: async (args: any = {}) => {
      let list = [...store.articles];

      if (args.where) {
        const w = args.where;
        if (w.status) {
          list = list.filter((a) => a.status === w.status);
        }
        if (w.authorId) {
          list = list.filter((a) => a.authorId === w.authorId);
        }
        if (w.categoryId) {
          list = list.filter((a) => a.categoryId === w.categoryId);
        }
        if (w.category?.slug) {
          const cat = store.categories.find((c) => c.slug === w.category.slug);
          list = list.filter((a) => a.categoryId === cat?.id);
        }
        if (w.id && typeof w.id === "object" && "not" in w.id) {
          list = list.filter((a) => a.id !== w.id.not);
        }
        if (w.publishedAt && typeof w.publishedAt === "object" && "not" in w.publishedAt) {
          list = list.filter((a) => a.publishedAt !== null);
        }
        if (w.tags?.some?.tag?.slug) {
          const targetTag = store.tags.find((t) => t.slug === w.tags.some.tag.slug);
          const articleIdsWithTag = new Set(
            store.articleTags.filter((at) => at.tagId === targetTag?.id).map((at) => at.articleId),
          );
          list = list.filter((a) => articleIdsWithTag.has(a.id));
        }
        if (w.OR && Array.isArray(w.OR)) {
          list = list.filter((a) => {
            const author = store.users.find((u) => u.id === a.authorId);
            return w.OR.some((cond: any) => {
              if (cond.title?.contains) return a.title.toLowerCase().includes(cond.title.contains.toLowerCase());
              if (cond.excerpt?.contains) return a.excerpt.toLowerCase().includes(cond.excerpt.contains.toLowerCase());
              if (cond.content?.contains) return a.content.toLowerCase().includes(cond.content.contains.toLowerCase());
              if (cond.author?.is?.OR) {
                return cond.author.is.OR.some((ac: any) => {
                  if (ac.name?.contains) return (author?.name ?? "").toLowerCase().includes(ac.name.contains.toLowerCase());
                  if (ac.username?.contains) return author?.username.toLowerCase().includes(ac.username.contains.toLowerCase());
                  return false;
                });
              }
              if (cond.tags?.some?.tag?.name?.contains) {
                const q = cond.tags.some.tag.name.contains.toLowerCase();
                const myTagIds = store.articleTags.filter((at) => at.articleId === a.id).map((at) => at.tagId);
                return store.tags.some((t) => myTagIds.includes(t.id) && t.name.toLowerCase().includes(q));
              }
              return false;
            });
          });
        }
      }

      // OrderBy
      if (args.orderBy) {
        const orderArr = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
        for (const order of orderArr) {
          if (order.views) {
            list.sort((a, b) => (order.views === "desc" ? b.views - a.views : a.views - b.views));
          } else if (order.publishedAt) {
            list.sort((a, b) => {
              const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
              const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
              return order.publishedAt === "desc" ? tb - ta : ta - tb;
            });
          } else if (order.createdAt) {
            list.sort((a, b) => {
              const ta = new Date(a.createdAt).getTime();
              const tb = new Date(b.createdAt).getTime();
              return order.createdAt === "desc" ? tb - ta : ta - tb;
            });
          } else if (order.updatedAt) {
            list.sort((a, b) => {
              const ta = new Date(a.updatedAt).getTime();
              const tb = new Date(b.updatedAt).getTime();
              return order.updatedAt === "desc" ? tb - ta : ta - tb;
            });
          }
        }
      }

      if (typeof args.skip === "number") {
        list = list.slice(args.skip);
      }
      if (typeof args.take === "number") {
        list = list.slice(0, args.take);
      }

      return list.map((a) => store.enrichArticle(a));
    },

    findUnique: async (args: any) => {
      const a = store.articles.find((item) => {
        if (args.where.slug) return item.slug === args.where.slug;
        if (args.where.id) return item.id === args.where.id;
        return false;
      });
      if (!a) return null;
      return store.enrichArticle(a);
    },

    findFirst: async (args: any) => {
      const rows = await prisma.article.findMany({ ...args, take: 1 });
      return rows[0] ?? null;
    },

    count: async (args: any = {}) => {
      const rows = await prisma.article.findMany(args);
      return rows.length;
    },

    aggregate: async (args: any = {}) => {
      const rows = await prisma.article.findMany(args);
      const sumViews = rows.reduce((acc, curr) => acc + (curr.views || 0), 0);
      return {
        _sum: {
          views: sumViews,
        },
      };
    },

    create: async (args: any) => {
      const d = args.data;
      const id = "art-" + Math.random().toString(36).slice(2, 9);
      const newArticle: MockArticle = {
        id,
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        content: d.content,
        coverImage: d.coverImage ?? null,
        status: d.status ?? "DRAFT",
        views: d.views ?? 0,
        readMinutes: d.readMinutes ?? 1,
        authorId: d.authorId,
        categoryId: d.categoryId,
        publishedAt: d.publishedAt ? new Date(d.publishedAt) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.articles.unshift(newArticle);

      // Handle tags create/connectOrCreate
      if (d.tags?.create && Array.isArray(d.tags.create)) {
        for (const item of d.tags.create) {
          const tData = item.tag?.connectOrCreate?.create ?? item.tag?.create;
          if (tData) {
            let existingTag = store.tags.find((t) => t.slug === tData.slug);
            if (!existingTag) {
              existingTag = { id: "tag-" + Math.random().toString(36).slice(2, 8), name: tData.name, slug: tData.slug };
              store.tags.push(existingTag);
            }
            store.articleTags.push({ articleId: id, tagId: existingTag.id });
          }
        }
      }

      return store.enrichArticle(newArticle);
    },

    update: async (args: any) => {
      const idx = store.articles.findIndex((a) => a.id === args.where.id);
      if (idx === -1) throw new Error("Article not found");
      const current = store.articles[idx];

      let newViews = current.views;
      if (args.data.views?.increment) {
        newViews += args.data.views.increment;
      } else if (typeof args.data.views === "number") {
        newViews = args.data.views;
      }

      const updated: MockArticle = {
        ...current,
        ...args.data,
        views: newViews,
        updatedAt: new Date(),
      };
      store.articles[idx] = updated;
      return store.enrichArticle(updated);
    },

    delete: async (args: any) => {
      const id = args.where.id;
      store.articles = store.articles.filter((a) => a.id !== id);
      store.articleTags = store.articleTags.filter((at) => at.articleId !== id);
      store.comments = store.comments.filter((c) => c.articleId !== id);
      store.likes = store.likes.filter((l) => l.articleId !== id);
      store.bookmarks = store.bookmarks.filter((b) => b.articleId !== id);
      return { id };
    },
  },

  // ------------------------------------------------------------
  // CATEGORY
  // ------------------------------------------------------------
  category: {
    findMany: async (args: any = {}) => {
      let list = [...store.categories];
      if (args.orderBy) {
        list.sort((a, b) => a.name.localeCompare(b.name));
      }
      return list.map((c) => {
        const articleCount = store.articles.filter((a) => {
          if (a.categoryId !== c.id) return false;
          if (args.include?._count?.select?.articles?.where?.status) {
            return a.status === args.include._count.select.articles.where.status;
          }
          return true;
        }).length;
        return {
          ...c,
          _count: {
            articles: articleCount,
          },
        };
      });
    },

    findUnique: async (args: any) => {
      const c = store.categories.find((item) => {
        if (args.where.slug) return item.slug === args.where.slug;
        if (args.where.id) return item.id === args.where.id;
        return false;
      });
      return c ?? null;
    },

    findFirst: async (args: any) => {
      const rows = await prisma.category.findMany(args);
      return rows[0] ?? null;
    },

    count: async () => store.categories.length,

    create: async (args: any) => {
      const newCat: MockCategory = {
        id: "cat-" + Math.random().toString(36).slice(2, 9),
        name: args.data.name,
        slug: args.data.slug,
        description: args.data.description ?? null,
      };
      store.categories.push(newCat);
      return newCat;
    },

    update: async (args: any) => {
      const idx = store.categories.findIndex((c) => c.id === args.where.id);
      if (idx !== -1) {
        store.categories[idx] = { ...store.categories[idx], ...args.data };
        return store.categories[idx];
      }
      throw new Error("Category not found");
    },

    delete: async (args: any) => {
      store.categories = store.categories.filter((c) => c.id !== args.where.id);
      return { id: args.where.id };
    },
  },

  // ------------------------------------------------------------
  // TAG
  // ------------------------------------------------------------
  tag: {
    findMany: async () => [...store.tags],
    findUnique: async (args: any) => {
      return store.tags.find((t) => (args.where.slug ? t.slug === args.where.slug : t.id === args.where.id)) ?? null;
    },
    count: async () => store.tags.length,
    create: async (args: any) => {
      const newTag: MockTag = {
        id: "tag-" + Math.random().toString(36).slice(2, 8),
        name: args.data.name,
        slug: args.data.slug,
      };
      store.tags.push(newTag);
      return newTag;
    },
  },

  articleTag: {
    create: async (args: any) => {
      store.articleTags.push({ articleId: args.data.articleId, tagId: args.data.tagId });
      return args.data;
    },
    deleteMany: async (args: any) => {
      if (args.where?.articleId) {
        store.articleTags = store.articleTags.filter((at) => at.articleId !== args.where.articleId);
      }
      return { count: 0 };
    },
  },

  // ------------------------------------------------------------
  // USER
  // ------------------------------------------------------------
  user: {
    findUnique: async (args: any) => {
      const u = store.users.find((item) => {
        if (args.where.email) return item.email === args.where.email;
        if (args.where.username) return item.username === args.where.username;
        if (args.where.id) return item.id === args.where.id;
        return false;
      });
      if (!u) return null;

      const articlesCount = store.articles.filter((a) => a.authorId === u.id).length;
      const followersCount = store.follows.filter((f) => f.followingId === u.id).length;
      const followingCount = store.follows.filter((f) => f.followerId === u.id).length;
      const commentsCount = store.comments.filter((c) => c.userId === u.id).length;

      return {
        ...u,
        _count: {
          articles: articlesCount,
          followers: followersCount,
          following: followingCount,
          comments: commentsCount,
        },
      };
    },

    findFirst: async (args: any) => {
      return (await prisma.user.findMany({ ...args, take: 1 }))[0] ?? null;
    },

    findMany: async (args: any = {}) => {
      let list = [...store.users];
      if (args.orderBy) {
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return list.map((u) => {
        const articlesCount = store.articles.filter((a) => a.authorId === u.id).length;
        const commentsCount = store.comments.filter((c) => c.userId === u.id).length;
        return {
          ...u,
          _count: {
            articles: articlesCount,
            comments: commentsCount,
          },
        };
      });
    },

    count: async (args: any = {}) => {
      if (args.where?.articles?.some) {
        const authorsWithArticles = new Set(
          store.articles.filter((a) => a.status === "PUBLISHED").map((a) => a.authorId),
        );
        return authorsWithArticles.size;
      }
      return store.users.length;
    },

    create: async (args: any) => {
      const d = args.data;
      const newUser: MockUser = {
        id: "usr-" + Math.random().toString(36).slice(2, 9),
        name: d.name ?? null,
        email: d.email,
        emailVerified: null,
        image: d.image ?? null,
        hashedPassword: d.hashedPassword ?? null,
        role: d.role ?? "READER",
        username: d.username,
        bio: d.bio ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.users.push(newUser);
      return newUser;
    },

    update: async (args: any) => {
      const idx = store.users.findIndex((u) => u.id === args.where.id);
      if (idx !== -1) {
        store.users[idx] = { ...store.users[idx], ...args.data, updatedAt: new Date() };
        return store.users[idx];
      }
      throw new Error("User not found");
    },
  },

  // ------------------------------------------------------------
  // COMMENT
  // ------------------------------------------------------------
  comment: {
    findUnique: async (args: any) => {
      const c = store.comments.find((item) => item.id === args.where.id);
      return c ?? null;
    },

    findMany: async (args: any = {}) => {
      let list = [...store.comments];
      if (args.where) {
        const w = args.where;
        if (w.articleId) list = list.filter((c) => c.articleId === w.articleId);
        if ("parentId" in w) list = list.filter((c) => c.parentId === w.parentId);
        if (typeof w.hidden === "boolean") list = list.filter((c) => c.hidden === w.hidden);
      }

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (typeof args.take === "number") list = list.slice(0, args.take);

      return list.map((c) => {
        const user = store.users.find((u) => u.id === c.userId) ?? {
          name: "Anonim",
          username: "anonim",
          image: null,
        };
        const article = store.articles.find((a) => a.id === c.articleId) ?? {
          title: "Artikel",
          slug: "",
        };
        const replies = store.comments
          .filter((rep) => rep.parentId === c.id && (!args.where?.hidden || rep.hidden === args.where.hidden))
          .map((rep) => {
            const repUser = store.users.find((u) => u.id === rep.userId) ?? {
              name: "Anonim",
              username: "anonim",
              image: null,
            };
            return {
              ...rep,
              user: repUser,
            };
          });

        return {
          ...c,
          user,
          article,
          replies,
          _count: {
            replies: replies.length,
          },
        };
      });
    },

    create: async (args: any) => {
      const newComment: MockComment = {
        id: "com-" + Math.random().toString(36).slice(2, 9),
        content: args.data.content,
        parentId: args.data.parentId ?? null,
        userId: args.data.userId,
        articleId: args.data.articleId,
        hidden: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.comments.push(newComment);
      return newComment;
    },

    update: async (args: any) => {
      const idx = store.comments.findIndex((c) => c.id === args.where.id);
      if (idx !== -1) {
        store.comments[idx] = { ...store.comments[idx], ...args.data };
        return store.comments[idx];
      }
      throw new Error("Comment not found");
    },

    delete: async (args: any) => {
      const id = args.where.id;
      store.comments = store.comments.filter((c) => c.id !== id && c.parentId !== id);
      return { id };
    },

    count: async (args: any = {}) => {
      let list = [...store.comments];
      if (typeof args.where?.hidden === "boolean") {
        list = list.filter((c) => c.hidden === args.where.hidden);
      }
      if (args.where?.article?.authorId) {
        const authorArticles = new Set(
          store.articles.filter((a) => a.authorId === args.where.article.authorId).map((a) => a.id),
        );
        list = list.filter((c) => authorArticles.has(c.articleId));
      }
      return list.length;
    },
  },

  // ------------------------------------------------------------
  // LIKE
  // ------------------------------------------------------------
  like: {
    findUnique: async (args: any) => {
      const key = args.where.userId_articleId;
      if (!key) return null;
      return store.likes.find((l) => l.userId === key.userId && l.articleId === key.articleId) ?? null;
    },

    create: async (args: any) => {
      const newLike: MockLike = {
        id: "like-" + Math.random().toString(36).slice(2, 8),
        userId: args.data.userId,
        articleId: args.data.articleId,
        createdAt: new Date(),
      };
      store.likes.push(newLike);
      return newLike;
    },

    delete: async (args: any) => {
      const key = args.where.userId_articleId;
      if (key) {
        store.likes = store.likes.filter((l) => !(l.userId === key.userId && l.articleId === key.articleId));
      }
      return { ok: true };
    },

    count: async (args: any = {}) => {
      if (args.where?.article?.authorId) {
        const authorArticles = new Set(
          store.articles.filter((a) => a.authorId === args.where.article.authorId).map((a) => a.id),
        );
        return store.likes.filter((l) => authorArticles.has(l.articleId)).length;
      }
      return store.likes.length;
    },
  },

  // ------------------------------------------------------------
  // BOOKMARK
  // ------------------------------------------------------------
  bookmark: {
    findUnique: async (args: any) => {
      const key = args.where.userId_articleId;
      if (!key) return null;
      return store.bookmarks.find((b) => b.userId === key.userId && b.articleId === key.articleId) ?? null;
    },

    findMany: async (args: any = {}) => {
      let list = store.bookmarks.filter((b) => b.userId === args.where?.userId);
      if (typeof args.skip === "number") list = list.slice(args.skip);
      if (typeof args.take === "number") list = list.slice(0, args.take);

      const enrichedList: Array<MockBookmark & { article: ReturnType<typeof store.enrichArticle> }> = [];
      for (const b of list) {
        const articleRaw = store.articles.find((a) => a.id === b.articleId) ?? store.articles[0];
        if (articleRaw) {
          enrichedList.push({
            ...b,
            article: store.enrichArticle(articleRaw),
          });
        }
      }
      return enrichedList;
    },

    create: async (args: any) => {
      const newBm: MockBookmark = {
        id: "bm-" + Math.random().toString(36).slice(2, 8),
        userId: args.data.userId,
        articleId: args.data.articleId,
        createdAt: new Date(),
      };
      store.bookmarks.push(newBm);
      return newBm;
    },

    delete: async (args: any) => {
      const key = args.where.userId_articleId;
      if (key) {
        store.bookmarks = store.bookmarks.filter((b) => !(b.userId === key.userId && b.articleId === key.articleId));
      }
      return { ok: true };
    },

    count: async (args: any = {}) => {
      if (args.where?.userId) {
        return store.bookmarks.filter((b) => b.userId === args.where.userId).length;
      }
      return store.bookmarks.length;
    },
  },

  // ------------------------------------------------------------
  // FOLLOW
  // ------------------------------------------------------------
  follow: {
    findUnique: async (args: any) => {
      const key = args.where.followerId_followingId;
      if (!key) return null;
      return store.follows.find((f) => f.followerId === key.followerId && f.followingId === key.followingId) ?? null;
    },

    create: async (args: any) => {
      const newFol: MockFollow = {
        id: "fol-" + Math.random().toString(36).slice(2, 8),
        followerId: args.data.followerId,
        followingId: args.data.followingId,
        createdAt: new Date(),
      };
      store.follows.push(newFol);
      return newFol;
    },

    delete: async (args: any) => {
      const key = args.where.followerId_followingId;
      if (key) {
        store.follows = store.follows.filter(
          (f) => !(f.followerId === key.followerId && f.followingId === key.followingId),
        );
      }
      return { ok: true };
    },

    count: async (args: any = {}) => {
      if (args.where?.followingId) {
        return store.follows.filter((f) => f.followingId === args.where.followingId).length;
      }
      if (args.where?.followerId) {
        return store.follows.filter((f) => f.followerId === args.where.followerId).length;
      }
      return store.follows.length;
    },
  },

  // ------------------------------------------------------------
  // IMAGE
  // ------------------------------------------------------------
  image: {
    create: async (args: any) => {
      const newImg: MockImage = {
        id: "img-" + Math.random().toString(36).slice(2, 8),
        url: args.data.url,
        articleId: args.data.articleId ?? null,
        createdAt: new Date(),
      };
      store.images.push(newImg);
      return newImg;
    },
    deleteMany: async () => ({ count: 0 }),
  },

  // ------------------------------------------------------------
  // AUTH STUBS
  // ------------------------------------------------------------
  account: {
    findFirst: async () => null,
    create: async (args: any) => args.data,
  },
  session: {
    findUnique: async () => null,
    create: async (args: any) => args.data,
    delete: async () => null,
  },
  verificationToken: {
    findUnique: async () => null,
    create: async (args: any) => args.data,
    delete: async () => null,
  },
};

export default prisma;
