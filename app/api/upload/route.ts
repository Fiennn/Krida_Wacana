import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { simpanUploadGambar, UploadError, MAX_UPLOAD_MB } from "@/lib/upload-service";

/**
 * POST /api/upload
 * - WAJIB login (semua pengguna terdaftar; tidak khusus admin).
 * - multipart/form-data dengan field "file", "preset" (cover|article|avatar).
 * - Validasi: jpg/png/webp, maksimal 5 MB, dikompres/resize otomatis (sharp).
 * - Response JSON: { url, width, height, bytes }
 */
const presetSchema = z.enum(["cover", "article", "avatar"]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Silakan masuk terlebih dahulu untuk mengunggah gambar." },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Format pengiriman tidak valid (harus multipart/form-data)." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const presetParsed = presetSchema.safeParse(form.get("preset") ?? "article");
  const preset = presetParsed.success ? presetParsed.data : "article";

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Tidak ada file yang dikirim (field 'file' wajib)." },
      { status: 400 },
    );
  }

  try {
    const hasil = await simpanUploadGambar(file, preset);
    return NextResponse.json({ ...hasil });
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("[upload] gagal:", e);
    return NextResponse.json(
      { error: `Kendala saat mengunggah gambar. Pastikan ukurannya di bawah ${MAX_UPLOAD_MB} MB.` },
      { status: 500 },
    );
  }
}
