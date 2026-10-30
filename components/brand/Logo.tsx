import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo Krida Wacana: kotak monogram "KW" + wordmark serif.
 */
export default function Logo({
  variant = "light", // "light" = di atas latar navy | "dark" = di atas latar putih
  withWordmark = true,
  className,
}: {
  variant?: "light" | "dark";
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="Krida Wacana — Beranda"
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-serif text-lg font-bold",
          "bg-amber-brand text-navy-dark shadow-glass transition-transform duration-200 group-hover:rotate-3 group-hover:scale-105",
        )}
        aria-hidden
      >
        KW
      </span>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-serif text-xl font-bold tracking-tight transition-colors",
              variant === "light" ? "text-white" : "text-navy",
            )}
          >
            Krida <span className="text-amber-brand">Wacana</span>
          </span>
          <span
            className={cn(
              "mt-1 text-[10px] font-medium uppercase tracking-[0.28em]",
              variant === "light" ? "text-white/60" : "text-ink-secondary",
            )}
          >
            Tulis. Bagikan.
          </span>
        </span>
      )}
    </Link>
  );
}
