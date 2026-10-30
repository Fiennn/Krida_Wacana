import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";
import {
  FOOTER_COLUMNS,
  SCHOOL_ADDRESS,
  SCHOOL_NAME,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-auto bg-navy-dark text-white/75">
      {/* Strip aksen kuning */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-brand via-amber-highlight to-amber-brand" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* Identitas sekolah */}
        <div className="space-y-4">
          <BrandLogo variant="light" size="sm" />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            {SITE_TAGLINE}
          </p>
          <div className="text-sm leading-relaxed text-white/50">
            <p className="font-semibold text-white/70">{SCHOOL_NAME}</p>
            <p>{SCHOOL_ADDRESS}</p>
          </div>
        </div>

        {/* Kolom tautan */}
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-amber-brand">
              {column.title}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bar bawah copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-white/50 sm:flex-row sm:px-6 sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}, {SCHOOL_NAME}, Kec.
            Baturraden, Kab. Banyumas.
          </p>
          <p>
            Portal artikel sekolah &middot;{" "}
            <span className="text-amber-brand/80">#TulisBagikanDibaca</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
