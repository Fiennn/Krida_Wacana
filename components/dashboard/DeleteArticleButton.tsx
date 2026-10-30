"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Tombol hapus artikel milik sendiri (dengan konfirmasi). */
export default function DeleteArticleButton({
  articleId,
  title,
}: {
  articleId: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function hapus() {
    if (busy) return;
    const yakin = window.confirm(
      `Hapus artikel "${title}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!yakin) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/artikel/${articleId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        alert(json?.error ?? "Gagal menghapus artikel.");
      }
      router.refresh();
    } catch {
      alert("Kendala jaringan. Coba lagi sebentar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={hapus}
      disabled={busy}
      className="inline-flex h-9 items-center rounded-full border border-rose-200 bg-white px-4 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
    >
      {busy ? "Menghapus…" : "Hapus"}
    </button>
  );
}
