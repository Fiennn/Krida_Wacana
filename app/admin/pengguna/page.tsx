import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ubahPeranAction } from "@/app/admin/actions";

export const metadata = { title: "Kelola Pengguna" };

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  PENULIS: "Penulis",
  READER: "Pembaca",
};

const ROLE_STYLE: Record<string, string> = {
  ADMIN: "bg-navy text-white",
  PENULIS: "bg-emerald-100 text-emerald-700",
  READER: "bg-surface-muted text-ink-secondary",
};

/** /admin/pengguna — atur peran pengguna (pembaca/penulis/admin). */
export default async function AdminPenggunaPage() {
  const session = await auth();
  const pengguna = await prisma.user.findMany({
    include: { _count: { select: { articles: true, comments: true } } },
    orderBy: [{ createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">Kelola Pengguna</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
            Akun baru berstatus <strong>Pembaca</strong>. Ubah menjadi{" "}
            <strong>Penulis</strong> agar guru/siswa terpilih dapat menulis artikel.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-ink-secondary shadow-card">
          {pengguna.length} pengguna
        </span>
      </header>

      <div className="space-y-3">
        {pengguna.map((u) => {
          const role = ROLE_LABEL[u.role] ? u.role : "READER";
          return (
            <article
              key={u.id}
              className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-base font-bold text-amber-brand">
                    {(u.name ?? u.username).slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 truncate text-sm font-bold text-ink">
                      {u.name ?? u.username}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          ROLE_STYLE[role],
                        )}
                      >
                        {ROLE_LABEL[role]}
                      </span>
                      {session?.user?.id === u.id && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-secondary">
                          (kamu)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-ink-secondary">
                      @{u.username} &middot; {u.email ?? "tanpa email"} &middot; bergabung{" "}
                      {formatDate(u.createdAt)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-secondary">
                      {u._count.articles} artikel &middot; {u._count.comments} komentar
                    </p>
                  </div>
                </div>

                <form
                  action={ubahPeranAction}
                  className="flex shrink-0 items-center gap-2"
                >
                  <input type="hidden" name="id" value={u.id} />
                  <label htmlFor={`role-${u.id}`} className="sr-only">
                    Peran {u.name ?? u.username}
                  </label>
                  <select
                    id={`role-${u.id}`}
                    name="role"
                    defaultValue={role}
                    className="h-9 rounded-xl border border-line bg-surface-muted px-3 text-xs font-semibold text-ink outline-none transition-colors focus:border-navy-royal"
                  >
                    <option value="READER">Pembaca</option>
                    <option value="PENULIS">Penulis</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center rounded-full bg-navy px-4 text-xs font-semibold text-white transition-colors hover:bg-navy-royal"
                  >
                    Simpan
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
