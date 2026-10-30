import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { artikeSchema, zodFirstMessage } from "@/lib/article-validation";
import { sanitizeArticleHtml, htmlToText } from "@/lib/sanitize";
import { slugify, readingTime } from "@/lib/utils";

/**
 * POST /api/artikel — buat artikel baru (DRAFT atau PUBLISHED).
 * Milik user yang sedang login.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Silakan masuk terlebih dahulu untuk menulis artikel." },
      { status: 401 },
    );
  }

  // Menulis hanya untuk guru/siswa yang disetujui admin
  if (session.user.role !== "ADMIN" && session.user.role !== "PENULIS") {
    return NextResponse.json(
      {
        error:
          "Akunmu belum diberi izin menulis. Hubungi admin sekolah untuk mengubah peran menjadi penulis.",
      },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Data yang dikirim tidak valid." }, { status: 400 });
  }

  const parsed = artikeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: zodFirstMessage(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  // Kategori wajib ada
  const category = await prisma.category.findUnique({ where: { slug: data.categorySlug } });
  if (!category) {
    return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 400 });
  }

  // Sanitasi HTML (cegah XSS) + waktu baca dari teks polos
  const konten = sanitizeArticleHtml(data.content);
  const teksPolos = htmlToText(konten);
  const readMinutes = readingTime(teksPolos);

  // Slug unik dari judul, tautan issuer:
  const slug = await generateUniqueSlug(data.title);

  try {
    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        // Ringkasan otomatis bila editor tidak mengisinya
        excerpt:
          data.excerpt?.trim() ||
          teksPolos.slice(0, 155),
        content: konten,
        coverImage: data.coverImage || null,
        status: data.status,
        readMinutes,
        authorId: session.user.id,
        categoryId: category.id,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        tags: {
          create: (data.tags ?? []).map((name) => ({
            tag: {
              connectOrCreate: {
                where: { slug: slugify(name) },
                create: { name, slug: slugify(name) },
              },
            },
          })),
        },
        images: {
          create: (data.galleryUrls ?? []).map((url) => ({ url })),
        },
      },
    });

    return NextResponse.json({ ok: true, id: article.id, slug: article.slug });
  } catch (e) {
    console.error("[artikel/create] gagal:", e);
    return NextResponse.json(
      { error: "Kendala saat menyimpan artikel. Coba lagi sebentar." },
      { status: 500 },
    );
  }
}

/** Slug unik dengan penomoran kalau bentrok. */
async function generateUniqueSlug(base: string): Promise<string> {
  const target = slugify(base);
  if (!(await prisma.article.findUnique({ where: { slug: target } }))) {
    return target;
  }
  for (let attempt = 1; attempt < 50; attempt++) {
    const kandidat = `${target}-${attempt}`;
    if (!(await prisma.article.findUnique({ where: { slug: kandidat } }))) {
      return kandidat;
    }
  }
  return `${target}-${Date.now().toString(36)}`;
}
