"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn, formatCompactNumber } from "@/lib/utils";

/**
 * Tombol Suka (client). Toggle via /api/artikel/[id]/like.
 * Bila belum login: aplikasi akan diarahkan ke /masuk oleh server (needAuth).
 */
export default function LikeButton({
  articleId,
  initialCount,
  initialLiked,
  isLoggedIn,
  variant = "pill",
}: {
  articleId: string;
  initialCount: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
  variant?: "pill" | "plain";
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!isLoggedIn) {
      // Akses dilarang → ke halaman masuk dengan tujuan kembali
      router.push(`/masuk?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    // Optimistic UI
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/artikel/${articleId}/like`, { method: "POST" });
      const json = await res.json();
      if (res.status === 401) {
        setLiked(!nextLiked);
        setCount((c) => c + (nextLiked ? -1 : 1));
        router.push("/masuk?next=" + encodeURIComponent(window.location.pathname));
        return;
      }
      if (!res.ok) {
        throw new Error(json?.error ?? "Gagal memproses suka.");
      }
      setLiked(json.liked);
      setCount(json.count);
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
      setError(e instanceof Error ? e.message : "Gagal memproses suka.");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={liked}
      aria-label={liked ? "Batalkan suka" : "Sukai artikel"}
      title={error ?? (liked ? "Batalkan suka" : "Sukai artikel")}
      className={cn(
        "inline-flex items-center gap-1.5 transition-all active:scale-95",
        variant === "pill"
          ? cn(
              "inline-flex h-9 items-center rounded-full border px-4 text-sm font-semibold transition-colors",
              liked
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-line bg-white text-ink hover:border-navy-royal hover:text-navy-royal",
            )
          : "text-sm font-semibold",
        error && "opacity-60",
      )}
    >
      <svg
        className={cn("h-4 w-4", liked ? "text-rose-500" : "text-ink-secondary/70")}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 2}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      {formatCompactNumber(count)}
    </button>
  );
}
