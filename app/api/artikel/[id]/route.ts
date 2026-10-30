import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { artikeSchema, zodFirstMessage } from "@/lib/article-validation";
import { sanitizeArticleHtml, htmlToText } from "@/lib/sanitize";
import { slugify, readingTime } from "@/lib/utils";
import { hapusFileLokal } from "@/lib/upload-service";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/artikel/[id] — perbarui artikel milik sendiri.
 * DELETE /api/artikel/[id] — hapus artikel milik sendiri.
 * Proteksi: hanya PEMILIK (atau ADMIN) yang boleh.
 */
async function guardOwnership(params: RouteParams["params"]) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Silakan masuk terlebih dahulu." },
        { status: 401 },
      ),
    };
  }

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { images: true, author: true },
  });
  if (!article) {
    return {
      error: NextResponse.json(
        { error: "Artikel tidak ditemukan." },
        { status: 404 },
      ),
    };
  }

  const isOwner =
    article.authorId === session.user.id ||
    (!!session.user.email && article.author.email === session.user.email);
  const isAdmin = session.user.role === "ADMIN";
  const isPenulis = session.user.role === "PENULIS";
  if (!isAdmin && !isPenulis) {
    return {
      error: NextResponse.json(
        { error: "Akunmu belum diberi izin menulis. Hubungi admin sekolah." },
        { status: 403 },
      ),
    };
  }
  if (!isOwner && !isAdmin) {
    return {
      error: NextResponse.json(
        { error: "Kamu tidak punya izin mengubah artikel ini." },
        { status: 403 },
      ),
    };
  }

  return { session, article };
}

export async function PATCH(req: NextRequest, route: RouteParams) {
  const guard = await guardOwnership(route.params);
  if (guard.error) return guard.error;
  const article = guard.article!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Data yang dikirim tidak valid." }, { status: 400 });
  }

  const partial = artikeSchema.partial().safeParse(body);
  if (!partial.success) {
    return NextResponse.json({ error: zodFirstMessage(partial.error) }, { status: 400 });
  }
  const data = partial.data;
  const patch: Record<string, unknown> = {};

  if (data.title !== undefined) patch.title = data.title.trim();

  if (data.content !== undefined) {
    const konten = sanitizeArticleHtml(data.content);
    patch.content = konten;
    patch.readMinutes = readingTime(htmlToText(konten));
  }

  if (data.excerpt !== undefined) patch.excerpt = data.excerpt.trim();

  if (data.categorySlug !== undefined) {
    const cat = await prisma.category.findUnique({ where: { slug: data.categorySlug } });
    if (!cat) {
      return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 400 });
    }
    patch.categoryId = cat.id;
  }

  if (data.coverImage !== undefined) {
    // Hapus cover lama dari disk bila sebenarnya diganti
    if (data.coverImage !== article.coverImage) {
      await hapusFileLokal(article.coverImage);
    }
    patch.coverImage = data.coverImage || null;
  }

  if (data.status !== undefined) {
    patch.status = data.status;
    // Bila pertama kali terbit: tetapkan waktu terbit
    if (data.status === "PUBLISHED" && !article.publishedAt) {
      patch.publishedAt = new Date();
    }
  }

  // Tag: ganti seluruh relasi bila dikirim
  if (data.tags !== undefined) {
    patch.tags = {
      deleteMany: {},
      create: data.tags.map((name) => ({
        tag: {
          connectOrCreate: {
            where: { slug: slugify(name) },
            create: { name, slug: slugify(name) },
          },
        },
      })),
    };
  }

  // Galeri: ganti seluruh foto bila dikirim
  if (data.galleryUrls !== undefined) {
    for (const img of article.images) {
      if (!data.galleryUrls.includes(img.url)) {
        await hapusFileLokal(img.url);
      }
    }
    patch.images = {
      deleteMany: {},
      create: data.galleryUrls.map((url) => ({ url })),
    };
  }

  try {
    await prisma.article.update({
      where: { id: article.id },
      data: patch as never,
    });
    return NextResponse.json({ ok: true, slug: article.slug });
  } catch (e) {
    console.error("[artikel/update] gagal:", e);
    return NextResponse.json(
      { error: "Kendala saat menyimpan perubahan. Coba lagi sebentar." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, route: RouteParams) {
  const guard = await guardOwnership(route.params);
  if (guard.error) return guard.error;
  const article = guard.article!;

  try {
    // Bersihkan file terkait dari disk
    await hapusFileLokal(article.coverImage);
    for (const img of article.images) {
      await hapusFileLokal(img.url);
    }

    // Relasi like/bookmark/komentar ikut terhapus (onDelete: Cascade)
    await prisma.article.delete({ where: { id: article.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[artikel/delete] gagal:", e);
    return NextResponse.json(
      { error: "Kendala saat menghapus artikel. Coba lagi sebentar." },
      { status: 500 },
    );
  }
}
