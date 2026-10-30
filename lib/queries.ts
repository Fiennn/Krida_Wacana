import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Pustaka query Prisma untuk halaman publik.
 * Semua data dirapihkan jadi bentuk `ArticleCardData` agar komponen UI sederhana.
 */

/** Bentuk ringkas yang dipakai semua kartu/artikel mini di halaman mana pun. */
export type ArticleCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  category: { name: string; slug: string };
  author: { name: string; username: string; image: string | null };
  publishedAt: Date | null;
  views: number;
  readMinutes: number;
  likesCount: number;
};

const articleInclude = {
  author: true,
  category: true,
  tags: { include: { tag: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

/** Semua artikel publik harus sudah terbit. */
const publishedFilter = {
  status: "PUBLISHED",
  publishedAt: { not: null },
} as const;

function toCard(a: PrismaArticleWithInclude): ArticleCardData {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    category: { name: a.category.name, slug: a.category.slug },
    author: {
      name: a.author.name ?? "Anonim",
      username: a.author.username,
      image: a.author.image,
    },
    publishedAt: a.publishedAt,
    views: a.views,
    readMinutes: a.readMinutes,
    likesCount: a._count.likes,
  };
}

type PrismaArticleWithInclude = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

// ==============================================================

export type Urutan = "terbaru" | "populer";

export type ListOpts = {
  page?: number;
  perPage?: number;
  kategoriSlug?: string;
  tagSlug?: string;
  q?: string;
  urutan?: Urutan;
};

/** Listing artikel (beranda, kategori, tag, pencarian) + data pagination. */
export async function listArticles(opts: ListOpts = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(24, Math.max(1, opts.perPage ?? 9));
  const urutan = opts.urutan ?? "terbaru";

  const whereClause = { ...publishedFilter } as Record<string, unknown>;
  if (opts.kategoriSlug) whereClause.category = { slug: opts.kategoriSlug };
  if (opts.tagSlug) whereClause.tags = { some: { tag: { slug: opts.tagSlug } } };
  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim();
    whereClause.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { content: { contains: q } },
      {
        author: {
          is: { OR: [{ name: { contains: q } }, { username: { contains: q } }] },
        },
      },
      { tags: { some: { tag: { name: { contains: q } } } } },
    ];
  }

  // Populer diurutkan berdasarkan jumlah pembaca (views)
  const orderBy =
    urutan === "populer"
      ? [{ views: "desc" } as const]
      : [{ publishedAt: "desc" } as const];

  const where = whereClause as never;

  const [rows, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: articleInclude,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items: rows.map(toCard),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Panel "Artikel Terpopuler" di hero beranda. */
export async function getPopularArticles(limit = 5) {
  const rows = await prisma.article.findMany({
    where: publishedFilter as never,
    include: articleInclude,
    orderBy: [{ views: "desc" }],
    take: limit,
  });
  return rows.map(toCard);
}

/** Daftar kategori beserta jumlah artikel terbit. */
export async function getCategoriesWithCount() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          articles: {
            where: publishedFilter as never,
          },
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });
  return categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    count: c._count.articles,
  }));
}

/** Detail artikel berdasarkan slug (publik: hanya yang terbit). */
export async function getArticleBySlug(slug: string) {
  const a = await prisma.article.findUnique({
    where: { slug },
    include: articleInclude,
  });
  if (!a || a.status !== "PUBLISHED") return null;

  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    coverImage: a.coverImage,
    views: a.views,
    readMinutes: a.readMinutes,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
    category: a.category,
    author: {
      id: a.author.id,
      name: a.author.name ?? "Anonim",
      username: a.author.username,
      image: a.author.image,
      bio: a.author.bio,
    },
    tags: a.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
    likesCount: a._count.likes,
    commentsCount: a._count.comments,
  };
}

/** Tambah jumlah pembaca (dipanggil saat halaman detail dibuka). */
export async function incrementViews(articleId: string) {
  try {
    await prisma.article.update({
      where: { id: articleId },
      data: { views: { increment: 1 } },
    });
  } catch {
    // jangan ganggu render bila gagal
  }
}

/** Artikel terkait (kategori sama, bukan artikel ini). */
export async function getRelatedArticles(categoryId: string, excludeId: string, limit = 3) {
  try {
    const rows = await prisma.article.findMany({
      where: { ...publishedFilter, categoryId, id: { not: excludeId } },
      include: articleInclude,
      orderBy: [{ publishedAt: "desc" }],
      take: limit,
    });
    return rows.map(toCard);
  } catch {
    return [];
  }
}

/** Statistik agregat untuk kartu hero. */
export async function getSiteStats() {
  const [totalArticles, totalAuthors, sumViews, totalCategories] =
    await Promise.all([
      prisma.article.count({ where: publishedFilter as never }),
      prisma.user.count({
        where: { articles: { some: publishedFilter as never } },
      }),
      prisma.article.aggregate({
        where: publishedFilter as never,
        _sum: { views: true },
      }),
      prisma.category.count(),
    ]);
  return {
    totalArticles,
    totalAuthors,
    totalViews: sumViews._sum.views ?? 0,
    totalCategories,
  };
}

/** Wajah profil penulis + statistik + daftar artikel terbitnya. */
export async function getAuthorByUsername(username: string, page = 1, perPage = 8) {
  const author = await prisma.user.findUnique({ where: { username } });
  if (!author) return null;

  const [artikelAktif, total, likesTerkumpul, pengikut, diikuti, sumViews] =
    await Promise.all([
      prisma.article.findMany({
        where: { ...publishedFilter, authorId: author.id },
        include: articleInclude,
        orderBy: [{ publishedAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.article.count({
        where: { ...publishedFilter, authorId: author.id },
      }),
      prisma.like.count({ where: { article: { authorId: author.id } } }),
      prisma.follow.count({ where: { followingId: author.id } }),
      prisma.follow.count({ where: { followerId: author.id } }),
      prisma.article.aggregate({
        where: { ...publishedFilter, authorId: author.id },
        _sum: { views: true },
      }),
    ]);

  return {
    author: {
      id: author.id,
      name: author.name ?? "Anonim",
      username: author.username,
      image: author.image,
      bio: author.bio,
      joinedAt: author.createdAt,
    },
    stats: {
      articles: total,
      views: sumViews._sum.views ?? 0,
      likes: likesTerkumpul,
      followers: pengikut,
      following: diikuti,
    },
    articles: artikelAktif.map(toCard),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}

/**
 * Komentar bersarang (root + replies) untuk halaman detail artikel.
 * `mine` = milik pembaca ini, `admin` = boleh dihapus admin.
 */
export async function getArticleComments(
  articleId: string,
  currentUserId: string | null,
  isAdmin: boolean,
) {
  type CNode = {
    id: string;
    content: string;
    createdAt: Date;
    userId: string;
    user: { name: string | null; username: string; image: string | null };
    mine: boolean;
    admin: boolean;
    replies: CNode[];
  };

  const viewerId = currentUserId;
  const visibility = isAdmin ? {} : { hidden: false };
  const rows = await prisma.comment.findMany({
    where: { articleId, parentId: null, ...visibility },
    include: {
      user: { select: { name: true, username: true, image: true } },
      replies: {
        where: visibility,
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, username: true, image: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapRow = (c: {
    id: string;
    content: string;
    createdAt: Date;
    userId: string;
    user: { name: string | null; username: string; image: string | null };
  }): CNode => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    userId: c.userId,
    user: c.user,
    mine: !!viewerId && c.userId === viewerId,
    admin: isAdmin,
    replies: [],
  });

  return rows.map(
    (c): CNode => ({
      ...mapRow(c),
      replies: c.replies.map(mapRow),
    }),
  );
}

/** Hitung jumlah pengikut seorang penulis. */
export function getFollowerCount(userId: string) {
  return prisma.follow.count({ where: { followingId: userId } });
}

/** Apakah `followerId` mengikuti `userId`? */
export function isFollowing(followerId: string | null, followingId: string) {
  if (!followerId) return Promise.resolve(false);
  return prisma.follow
    .findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      select: { id: true },
    })
    .then((r) => !!r);
}
