"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateProfilAction } from "@/app/profil/actions";
import type { ProfilActionResult } from "@/app/profil/actions";
import { cn } from "@/lib/utils";

type User = {
  name?: string | null;
  username?: string;
  bio?: string | null;
  image?: string | null;
};

const stateAwal: ProfilActionResult = {};

/**
 * Form edit profil: foto (upload), nama, username, bio.
 * Server action memperbarui database; `update()` menyinkronkan
 * sesi JWT sehingga nama/foto baru langsung tampil.
 */
export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { update } = useSession() as { update: (data?: unknown) => Promise<unknown> };

  const [state, formAction, isPending] = useActionState(updateProfilAction, stateAwal);
  const fieldErrors = state?.fieldErrors ?? {};

  // Avatar (URL) dikelola lewat state; value ikut ke hidden input
  const [avatarUrl, setAvatarUrl] = useState<string>(user.image ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);

  function inputCls(field: string) {
    return cn(
      "mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-navy-royal",
      fieldErrors[field] && "border-rose-400",
    );
  }

  function fieldError(field: string) {
    return fieldErrors[field] ? (
      <p className="mt-1 text-xs text-rose-600">{fieldErrors[field]}</p>
    ) : null;
  }

  return (
    <form
      action={async (formData: FormData) => {
        // image sudah berada di input hidden dengan nilai avatarUrl
        formData.set("image", avatarUrl);
        await formAction(formData);
        // Sinkronkan sesi (nama/foto baru) tanpa login ulang
        try {
          await update({ name: formData.get("name"), username: formData.get("username"), picture: avatarUrl || null });
          router.refresh();
        } catch {
          // bila gagal, data DB sudah tersimpan; sesi memperbarui saat login berikutnya
        }
      }}
      className="space-y-5"
    >
      {state?.error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Profil berhasil diperbarui.
        </div>
      )}

      {/* Foto profil */}
      <div className="flex items-start gap-4">
        {/* Pratinjau avatar */}
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Foto profil"
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-navy font-serif text-2xl font-bold text-amber-brand">
            {`${user.name ?? "K"}`.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Foto Profil
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploadingImage}
            className="mt-1.5 block w-full text-xs text-ink-secondary file:mr-3 file:h-9 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-royal disabled:opacity-60"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingImage(true);
              try {
                const fd = new FormData();
                fd.set("file", file);
                fd.set("preset", "avatar");
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const json = await res.json();
                if (!res.ok) throw new Error(json?.error ?? "Gagal mengunggah.");
                setAvatarUrl(json.url);
              } catch (err) {
                alert(err instanceof Error ? err.message : "Gagal mengunggah.");
              } finally {
                setUploadingImage(false);
                e.target.value = "";
              }
            }}
          />
          <p className="mt-1 text-xs text-ink-secondary">
            {uploadingImage
              ? "Mengunggah foto…"
              : "JPG/PNG/WebP, maks 5 MB. Resolusi otomatis dipotong persegi 512px."}
          </p>
          {avatarUrl && (
            <button
              type="button"
              className="mt-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
              onClick={() => setAvatarUrl("")}
            >
              Hapus foto profil
            </button>
          )}
        </div>
      </div>

      {/* Nama + username */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-name" className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Nama Lengkap
          </label>
          <input
            id="pf-name"
            name="name"
            defaultValue={user.name ?? ""}
            className={inputCls("name")}
            required
          />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="pf-username" className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Username
          </label>
          <input
            id="pf-username"
            name="username"
            defaultValue={user.username ?? ""}
            className={inputCls("username")}
            required
          />
          {fieldError("username")}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="pf-bio" className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
          Bio (opsional)
        </label>
        <textarea
          id="pf-bio"
          name="bio"
          defaultValue={user.bio ?? ""}
          rows={3}
          maxLength={500}
          placeholder="Satu-dua kalimat tentang dirimu… muncul di halaman profil penulis."
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-navy-royal"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || uploadingImage}
          className="inline-flex h-11 items-center justify-center rounded-full bg-amber-brand px-6 text-sm font-bold text-navy-dark transition-all hover:bg-amber-highlight active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
        <span className="text-xs text-ink-secondary">
          Diterapkan ke halaman profil penulis kamu.
        </span>
      </div>
    </form>
  );
}
