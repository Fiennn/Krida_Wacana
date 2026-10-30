import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LOGO_FILES } from "@/lib/constants";

/**
 * BrandLogo — identitas visual Krida Wacana, SD Negeri 2 Kemutug Lor.
 *
 * Susunan: satu kotak glass berisi 3 logo (Tut Wuri Handayani,
 * SDN 2 Kemutug Lor, Krida Wacana) + blok teks nama di kanannya.
 *
 * Varian:
 * - `light`  : di atas latar navy (header, footer)
 * - `dark`   : di atas latar putih
 * - `center` : bertumpuk di tengah (halaman /masuk & /daftar)
 */
export default function BrandLogo({
  variant = "light",
  size = "md",
  align = "left",
  className,
}: {
  variant?: "light" | "dark" | "center";
  size?: "md" | "sm";
  align?: "left" | "center";
  className?: string;
}) {
  const center = variant === "center" || align === "center";
  const light = variant !== "dark";

  const imgSize =
    size === "sm"
      ? "h-6 w-6 sm:h-8 sm:w-8"
      : "h-6 w-6 sm:h-10 sm:w-10";

  const titleSize =
    size === "sm"
      ? "text-sm sm:text-xl"
      : "text-[13px] sm:text-2xl";

  const content = (
    <span
      className={cn(
        "flex items-center gap-3",
        center && "flex-col gap-2.5 text-center",
      )}
    >
      {/* Kotak glass berisi 3 logo */}
      <span
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-2xl border p-1 backdrop-blur-md sm:gap-2 sm:p-2",
          light
            ? "border-white/20 bg-white/10"
            : "border-line bg-navy/[0.04]",
        )}
      >
        <Image
          src={LOGO_FILES.tutWuri}
          alt="Logo Tut Wuri Handayani, Kementerian Pendidikan"
          width={80}
          height={80}
          className={cn(imgSize, "object-contain")}
        />
        <Image
          src={LOGO_FILES.sekolah}
          alt="Logo SD Negeri 2 Kemutug Lor"
          width={80}
          height={80}
          className={cn(imgSize, "object-contain")}
        />
        <Image
          src={LOGO_FILES.krida}
          alt="Logo Krida Wacana"
          width={80}
          height={80}
          className={cn(imgSize, "rounded-full bg-white object-contain")}
        />
      </span>

      {/* Blok teks nama */}
      <span className={cn("flex flex-col leading-none", center && "items-center")}>
        <span
          className={cn(
            "hidden text-[9px] font-bold uppercase tracking-[0.28em] sm:block",
            light ? "text-amber-brand" : "text-amber-600",
          )}
        >
          Portal Artikel Sekolah
        </span>

        <span
          className={cn(
            "mt-1 flex flex-row whitespace-nowrap font-serif font-bold leading-[0.95] tracking-tight sm:flex-col",
            center ? "justify-center" : "",
            light ? "text-amber-highlight" : "text-navy",
          )}
        >
          <span className={cn(titleSize, "block")}>KRIDA</span>
          <span className={cn(titleSize, "block", "ml-1 sm:ml-0")}>WACANA</span>
        </span>

        <span
          className={cn(
            "mt-1.5 whitespace-nowrap text-[6px] font-semibold uppercase tracking-[0.08em] sm:text-[9px] sm:tracking-[0.2em]",
            light ? "text-white/70" : "text-ink-secondary",
          )}
        >
          SD Negeri 2 Kemutug Lor
        </span>
      </span>
    </span>
  );

  if (variant === "center") {
    return <div className={cn("flex justify-center", className)}>{content}</div>;
  }

  return (
    <Link
      href="/"
      aria-label="Krida Wacana — Beranda"
      className={cn("group inline-flex items-center", className)}
    >
      {content}
    </Link>
  );
}
