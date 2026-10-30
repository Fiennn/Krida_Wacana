import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleEditor from "@/components/editor/ArticleEditor";

export const metadata = {
  title: "Tulis Artikel",
};

/**
 * /tulis — Editor artikel baru (hanya untuk user yang sudah login).
 */
export default async function TulisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk?next=/tulis");
  // Menulis hanya untuk guru/siswa yang disetujui admin
  if (session.user.role !== "ADMIN" && session.user.role !== "PENULIS") {
    redirect("/dashboard?izin=menulis");
  }

  const kategoriList = await prisma.category.findMany({
    orderBy: [{ name: "asc" }],
    select: { name: true, slug: true },
  });

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-brand">
          Ruang Tulis
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ink sm:text-4xl">
          Tulis Artikel{" "}
          <span className="text-amber-brand">Baru</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-secondary">
          Bagikan kabar kegiatan sekolah, prestasi siswa, atau catatan
          pembelajaran. Simpan dulu sebagai draf, atau terbitkan agar seluruh
          pembaca dapat membacanya.
        </p>
      </header>

      <ArticleEditor kategoriList={kategoriList} />
    </section>
  );
}
