import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/artikel/[id]/like — toggle suka artikel milik siapa pun
 * (komentar/like tidak butuh login di sisi publik; tapi standar komunitas
 * kami: HARUS login. Tombol akan mengarahkan pembaca ke /masuk bila belum).
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Masuk dulu untuk menyukai artikel ini.", needAuth: true },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;
  const article = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!article) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId: id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId: session.user.id, articleId: id } });
  }

  const count = await prisma.like.count({ where: { articleId: id } });
  return NextResponse.json({ ok: true, liked: !existing, count });
}
