/**
 * Komponen bersama untuk halaman masuk/daftar:
 * Suasana navy gradien, BrandLogo di tengah, kartu glass, aksen kuning.
 */
import BrandLogo from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy-royal to-navy-dark px-4 py-14">
      {/* Dekorasi latar */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 select-none font-serif text-[14rem] font-bold text-white/5">
        KW
      </span>
      <span aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-amber-brand/10 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <BrandLogo variant="center" />
        {children}
      </div>
    </section>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-strong relative z-10 w-full max-w-md rounded-3xl p-8 shadow-glass backdrop-blur-xl",
        "animate-fade-in-up",
        className,
      )}
    >
      <h1 className="text-center font-serif text-2xl font-bold text-white sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-center text-sm text-white/60">{subtitle}</p>
      <div className="mt-7">{children}</div>
      <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-white/60">
        {footer}
      </div>
    </div>
  );
}

export function AlertError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-100"
    >
      <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
      </svg>
      <p>{message}</p>
    </div>
  );
}

export const inputGlass =
  "h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-amber-brand/60 focus:bg-white/15 focus:ring-2 focus:ring-amber-brand/25";

export const labelGlass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60";

export const buttonAmber =
  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-amber-brand px-6 text-sm font-bold text-navy-dark transition-all hover:bg-amber-highlight hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
