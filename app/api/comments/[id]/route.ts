import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

/**
 * DELETE /api/comments/[id] — hapus komentar sendiri (atau admin).
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Masuk dulu untuk menghapus komentar." },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: "Komentar tidak ditemukan." }, { status: 404 });
  }

  const isOwner = comment.userId === session.user.id;
  if (!isOwner && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Kamu tidak punya izin menghapus komentar ini." },
      { status: 403 },
    );
  }

  await prisma.comment.delete({ where: { id } }); // balasan ikut terhapus (cascade)
  return NextResponse.json({ ok: true });
}
