import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/admin/CategoryForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { ubahKategoriAction, hapusKategoriAction } from "@/app/admin/actions";

export const metadata = { title: "Kelola Kategori" };

export const dynamic = "force-dynamic";

/** /admin/kategori — tambah, ubah nama, dan hapus kategori. */
export default async function AdminKategoriPage() {
  const kategori = await prisma.category.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">Kelola Kategori</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Kategori dipakai untuk mengelompokkan artikel di beranda dan halaman kategori.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <CategoryForm />

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-ink">Daftar Kategori</h2>

          {kategori.map((k) => (
            <div
              key={k.id}
              className="rounded-2xl border border-line bg-white p-4 shadow-card"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form action={ubahKategoriAction} className="flex min-w-0 flex-1 items-center gap-2">
                  <input type="hidden" name="id" value={k.id} />
                  <input
                    name="name"
                    defaultValue={k.name}
                    required
                    minLength={2}
                    maxLength={40}
                    aria-label={`Nama kategori ${k.name}`}
                    className="h-9 min-w-0 flex-1 rounded-xl border border-line bg-surface-muted px-3 text-sm font-semibold text-ink outline-none transition-colors focus:border-navy-royal focus:bg-white focus:ring-2 focus:ring-navy-royal/15"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-9 shrink-0 items-center rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink transition-colors hover:border-navy-royal hover:text-navy-royal"
                  >
                    Simpan
                  </button>
                </form>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-ink-secondary">
                    {k._count.articles} artikel
                  </span>
                  {k._count.articles === 0 ? (
                    <form action={hapusKategoriAction}>
                      <input type="hidden" name="id" value={k.id} />
                      <ConfirmSubmit
                        label="Hapus"
                        variant="danger"
                        confirm={`Hapus kategori "${k.name}"?`}
                      />
                    </form>
                  ) : (
                    <span
                      className="text-[11px] text-ink-secondary"
                      title="Kategori masih dipakai artikel"
                    >
                      Tidak bisa dihapus
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-1.5 truncate text-xs text-ink-secondary">
                /kategori/{k.slug}
                {k.description ? ` · ${k.description}` : ""}
              </p>
            </div>
          ))}

          {kategori.length === 0 && (
            <p className="rounded-2xl border border-line bg-white p-6 text-center text-sm text-ink-secondary shadow-card">
              Belum ada kategori.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
