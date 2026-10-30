import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ username: string }> };

/**
 * POST /api/penulis/[username]/follow — toggle mengikuti penulis.
 * Wajib login. Wajib: tidak boleh mem-follow diri sendiri.
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Masuk dulu untuk mengikuti penulis.", needAuth: true },
      { status: 401 },
    );
  }

  const { username } = await ctx.params;
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    return NextResponse.json({ error: "Penulis tidak ditemukan." }, { status: 404 });
  }
  if (target.id === session.user.id) {
    return NextResponse.json(
      { error: "Kamu tidak bisa mengikuti akunmu sendiri." },
      { status: 400 },
    );
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: target.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: target.id },
    });
  }

  const count = await prisma.follow.count({ where: { followingId: target.id } });
  return NextResponse.json({ ok: true, following: !existing, followers: count });
}
