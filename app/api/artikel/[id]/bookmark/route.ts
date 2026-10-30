import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/artikel/[id]/bookmark — toggle simpan (bookmark) artikel.
 * Wajib login; daftar tersimpan ada di halaman /tersimpan.
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Masuk dulu untuk menyimpan artikel ini.", needAuth: true },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;
  const article = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!article) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId: id } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({ data: { userId: session.user.id, articleId: id } });
  }

  const count = await prisma.bookmark.count({ where: { articleId: id } });
  return NextResponse.json({ ok: true, bookmarked: !existing, count });
}
