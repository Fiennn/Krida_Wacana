"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Tombol Simpan/Bookmark (client). Toggle /api/artikel/[id]/bookmark.
 */
export default function BookmarkButton({
  articleId,
  initialBookmarked,
  isLoggedIn,
}: {
  articleId: string;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!isLoggedIn) {
      router.push(`/masuk?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const next = !bookmarked;
    setBookmarked(next);
    try {
      const res = await fetch(`/api/artikel/${articleId}/bookmark`, { method: "POST" });
      const json = await res.json();
      if (res.status === 401) {
        setBookmarked(!next);
        router.push("/masuk?next=" + encodeURIComponent(window.location.pathname));
        return;
      }
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan.");
      setBookmarked(json.bookmarked);
    } catch (e) {
      setBookmarked(!next);
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Hapus dari tersimpan" : "Simpan artikel"}
      title={error ?? (bookmarked ? "Hapus dari tersimpan" : "Simpan artikel")}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-full border transition-colors active:scale-95",
        bookmarked
          ? "border-amber-300 bg-amber-50 text-amber-700"
          : "border-line bg-white text-ink hover:border-navy-royal hover:text-navy-royal",
      )}
    >
      <svg
        className="h-4 w-4"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={bookmarked ? 0 : 2}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
