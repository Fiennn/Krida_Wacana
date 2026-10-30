"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";

/* ============================================================
 * Section komentar (client) — daftar, balasan, hapus.
 * Data awal dikirim dari server (server component).
 * ============================================================ */

export type CommentUser = {
  name: string | null;
  username: string;
  image: string | null;
};

export type CommentNode = {
  id: string;
  content: string;
  createdAt: string | Date;
  userId: string;
  user: CommentUser;
  replies: CommentNode[];
  mine: boolean;
  admin: boolean;
};

type Props = {
  articleId: string;
  comments: CommentNode[];
  currentUserId: string | null;
  currentAvatar?: string | null;
  total: number;
};

export default function CommentSection({
  articleId,
  comments,
  currentUserId,
  currentAvatar,
  total,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!currentUserId;

  return (
    <section id="komentar" className="mt-12 scroll-mt-28">
      <h2 className="font-serif text-2xl font-bold text-ink">
        Diskusi <span className="text-amber-brand">({total})</span>
      </h2>

      {/* Form komentar baru */}
      {isLoggedIn ? (
        <CommentFormInline
          articleId={articleId}
          avatar={currentAvatar}
          name="Tulis komentar…"
          cta="Kirim"
          onSuccess={() => router.refresh()}
        />
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-white px-5 py-4 text-sm text-ink-secondary shadow-card">
          <Link
            href={`/masuk?next=${encodeURIComponent(pathname)}`}
            className="font-semibold text-navy-royal underline-offset-2 hover:underline"
          >
            Masuk
          </Link>{" "}
          untuk ikut berdiskusi — gratis, tanpa syarat.
        </div>
      )}

      {/* Daftar komentar */}
      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface-muted px-5 py-6 text-center text-sm text-ink-secondary">
            Belum ada komentar. Jadilah yang pertama memberi tanggapan!
          </p>
        ) : (
          comments.map((c) => (
            <CommentBubble
              key={c.id}
              comment={c}
              articleId={articleId}
              currentUserId={currentUserId}
              onDeleted={() => router.refresh()}
            />
          ))
        )}
      </div>
    </section>
  );
}

/* ----------------------- Satu komentar ----------------------- */

function CommentBubble({
  comment,
  articleId,
  currentUserId,
  onDeleted,
}: {
  comment: CommentNode;
  articleId: string;
  currentUserId: string | null;
  onDeleted: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);

  async function hapus() {
    if (!window.confirm("Hapus komentar ini, beserta balasannya?")) return;
    const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        {comment.user.image ? (
          <Image
            src={comment.user.image}
            alt={comment.user.name ?? "Avatar"}
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-amber-brand">
            {(comment.user.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <Link
              href={`/penulis/${comment.user.username}`}
              className="text-sm font-bold text-ink hover:text-navy-royal"
            >
              {comment.user.name}
            </Link>
            <span className="text-xs text-ink-secondary">
              {formatDate(comment.createdAt)}
            </span>
            {(comment.mine || comment.admin) && (
              <button
                type="button"
                onClick={hapus}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-600"
              >
                Hapus
              </button>
            )}
            {currentUserId && (
              <button
                type="button"
                onClick={() => setReplyOpen((v) => !v)}
                className="text-[11px] font-semibold text-navy-royal hover:underline"
              >
                Balas
              </button>
            )}
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {comment.content}
          </p>
        </div>
      </div>

      {/* Form balasan */}
      {replyOpen && currentUserId && (
        <div className="mt-3 pl-12">
          <CommentFormInline
            articleId={articleId}
            parentId={comment.id}
            avatar={null}
            name="Tulis balasan…"
            cta="Balas"
            onCancel={() => setReplyOpen(false)}
            onDeleted={onDeleted}
          />
        </div>
      )}

      {/* Daftar balasan */}
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-line pl-4 sm:pl-6">
          {comment.replies.map((r) => (
            <ReplyRow key={r.id} reply={r} currentUserId={currentUserId} onDeleted={onDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyRow({
  reply,
  currentUserId,
  onDeleted,
}: {
  reply: CommentNode;
  currentUserId: string | null;
  onDeleted: () => void;
}) {
  async function hapus() {
    if (!window.confirm("Hapus balasan ini?")) return;
    const res = await fetch(`/api/comments/${reply.id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
  }

  return (
    <div className="flex items-start gap-2.5">
      {reply.user.image ? (
        <Image
          src={reply.user.image}
          alt={reply.user.name ?? "Avatar"}
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-royal text-[10px] font-bold text-white">
          {(reply.user.name ?? "?").slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1 text-sm">
        <div className="flex flex-wrap items-center gap-x-2">
          <Link
            href={`/penulis/${reply.user.username}`}
            className="font-bold text-ink hover:text-navy-royal"
          >
            {reply.user.name}
          </Link>
          <span className="text-[11px] text-ink-secondary">{formatDate(reply.createdAt)}</span>
          {(reply.mine || reply.admin) && (
            <button
              type="button"
              onClick={hapus}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-600"
            >
              Hapus
            </button>
          )}
        </div>
        <p className="mt-0.5 whitespace-pre-wrap leading-relaxed text-ink">{reply.content}</p>
      </div>
    </div>
  );
}

/* ----------------------- Form inline ----------------------- */

function CommentFormInline({
  articleId,
  parentId,
  avatar,
  name,
  cta,
  onSuccess,
  onCancel,
}: {
  articleId: string;
  parentId?: string;
  avatar?: string | null;
  name: string;
  cta: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onDeleted?: () => void;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const konten = value.trim();
    if (konten.length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/artikel/${articleId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: konten, parentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Gagal mengirim komentar.");
      setValue("");
      onSuccess?.();
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim komentar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex items-start gap-2.5">
      {avatar ? (
        <Image src={avatar} alt="Avatar" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="hidden h-9 w-9 shrink-0 rounded-full bg-surface-muted sm:block" aria-hidden />
      )}
      <div className="flex-1">
        <textarea
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={1000}
          placeholder={name}
          className={cn(
            "w-full resize-none rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors",
            "placeholder:text-ink-secondary/70 focus:border-navy-royal focus:ring-2 focus:ring-navy-royal/15",
            parentId && "min-h-[60px]",
          )}
        />
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="submit"
            disabled={busy || value.trim().length < 2}
            className="inline-flex h-9 items-center rounded-full bg-navy px-5 text-xs font-bold text-white transition-colors hover:bg-navy-royal disabled:opacity-50"
          >
            {busy ? "Mengirim…" : cta}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-ink-secondary hover:text-ink"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
