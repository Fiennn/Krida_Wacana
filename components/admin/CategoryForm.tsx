"use client";

import { useActionState } from "react";
import { buatKategoriAction, type KategoriFormState } from "@/app/admin/actions";

const initialState: KategoriFormState = {};

/** Form tambah kategori di /admin/kategori. */
export default function CategoryForm() {
  const [state, formAction, pending] = useActionState(buatKategoriAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-line bg-white p-5 shadow-card">
      <div>
        <h2 className="font-serif text-lg font-bold text-ink">Tambah Kategori</h2>
        <p className="mt-1 text-xs text-ink-secondary">
          Nama kategori akan otomatis menjadi slug URL.
        </p>
      </div>

      <div>
        <label htmlFor="kategori-nama" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
          Nama kategori
        </label>
        <input
          id="kategori-nama"
          name="name"
          required
          minLength={2}
          maxLength={40}
          placeholder="Contoh: Pengumuman"
          className="h-11 w-full rounded-xl border border-line bg-surface-muted px-4 text-sm text-ink outline-none transition-all placeholder:text-ink-secondary/70 focus:border-navy-royal focus:bg-white focus:ring-2 focus:ring-navy-royal/15"
        />
      </div>

      <div>
        <label htmlFor="kategori-deskripsi" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
          Deskripsi (opsional)
        </label>
        <textarea
          id="kategori-deskripsi"
          name="description"
          rows={2}
          maxLength={160}
          placeholder="Penjelasan singkat isi kategori"
          className="w-full resize-none rounded-xl border border-line bg-surface-muted px-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink-secondary/70 focus:border-navy-royal focus:bg-white focus:ring-2 focus:ring-navy-royal/15"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {state.error}
        </p>
      )}
      {state.sukses && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          {state.sukses}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-full bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-royal disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Tambah Kategori"}
      </button>
    </form>
  );
}
