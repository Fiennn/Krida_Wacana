import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { zodFirstMessage } from "@/lib/article-validation";

type Ctx = { params: Promise<{ id: string }> };

const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "Komentar minimal 2 karakter.")
    .max(1000, "Komentar maksimal 1000 karakter."),
  // Opsional: hanya untuk balasan terhadap komentar yang ada
  parentId: z.string().trim().optional(),
});

/**
 * POST /api/artikel/[id]/comment — tulis komentar (atau balasan).
 * Wajib login. Konten disimpan sebagai teks polos (aman dari XSS).
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Masuk dulu untuk menulis komentar.", needAuth: true },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;
  const article = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!article) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: zodFirstMessage(parsed.error) }, { status: 400 });
  }

  let parentId: string | null = null;
  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parsed.data.parentId } });
    if (!parent || parent.articleId !== id) {
      return NextResponse.json({ error: "Komentar induk tidak ditemukan." }, { status: 400 });
    }
    parentId = parent.id;
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      articleId: id,
      userId: session.user.id,
      parentId,
    },
    include: {
      user: { select: { name: true, username: true, image: true } },
    },
  });

  return NextResponse.json({ ok: true, comment });
}
