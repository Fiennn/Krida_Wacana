"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tombol submit bertipe confirm (khusus form admin).
 * Dipakai di dalam <form action={serverAction}> supaya konfirmasi dulu.
 */
export default function ConfirmSubmit({
  label,
  confirm,
  variant = "normal",
  className,
}: {
  label: string;
  confirm: string;
  variant?: "normal" | "danger" | "primary";
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="submit"
      disabled={busy}
      onClick={(e) => {
        if (!window.confirm(confirm)) {
          e.preventDefault();
          return;
        }
        setBusy(true);
      }}
      className={cn(
        "inline-flex h-8 items-center whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-60",
        variant === "danger" &&
          "border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
        variant === "primary" &&
          "border-navy bg-navy text-white hover:bg-navy-royal",
        variant === "normal" &&
          "border-line bg-white text-ink hover:border-navy-royal hover:text-navy-royal",
        className,
      )}
    >
      {busy ? "…" : label}
    </button>
  );
}
