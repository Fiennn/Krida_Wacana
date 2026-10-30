"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatCompactNumber } from "@/lib/utils";

/**
 * Tombol Ikuti penulis (dipakai di detail artikel & halaman penulis).
 */
export default function FollowButton({
  username,
  initialFollowing,
  initialFollowers,
  isLoggedIn,
  isOwn,
  className,
}: {
  username: string;
  initialFollowing: boolean;
  initialFollowers: number;
  isLoggedIn: boolean;
  isOwn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [busy, setBusy] = useState(false);

  if (isOwn) {
    return (
      <span className={cn("inline-flex h-10 items-center rounded-full border border-line bg-surface-muted px-5 text-sm font-medium text-ink-secondary", className)}>
        Profil kamu
      </span>
    );
  }

  async function toggle() {
    if (!isLoggedIn) {
      router.push(`/masuk?next=${encodeURIComponent(`/penulis/${username}`)}`);
      return;
    }
    setBusy(true);
    const next = !following;
    try {
      const res = await fetch(`/api/penulis/${username}/follow`, { method: "POST" });
      const json = await res.json();
      if (res.status === 401) {
        router.push("/masuk?next=" + encodeURIComponent(`/penulis/${username}`));
        return;
      }
      if (!res.ok) throw new Error(json?.error ?? "Gagal memproses ikuti.");
      setFollowing(json.following);
      setFollowers(json.followers);
    } catch {
      // biarkan state semula
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={following}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-all active:scale-95 disabled:opacity-60",
        following
          ? "border border-line bg-white text-ink hover:border-rose-300 hover:text-rose-600"
          : "bg-amber-brand text-navy-dark hover:bg-amber-highlight shadow-sm",
        className,
      )}
    >
      {following ? (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
          </svg>
          Mengikuti &middot; {formatCompactNumber(followers)}
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Ikuti &middot; {formatCompactNumber(followers)}
        </>
      )}
    </button>
  );
}
