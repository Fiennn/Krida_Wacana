import { formatCompactNumber } from "@/lib/utils";

/**
 * Section header untuk halaman kategori/tag/hasil pencarian: judul serif besar,
 * garis aksen kuning, deskripsi singkat, lalu meta kecil.
 */
export function SectionHeader({
  kicker,
  title,
  description,
  meta,
}: {
  kicker: string;
  title: string;
  description?: string | null;
  meta?: { nama: string; nilai: string | number }[];
}) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-brand">
        {kicker}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold text-ink sm:text-4xl">
        {title}
      </h1>
      <div className="mt-3 h-1 w-16 rounded-full bg-amber-brand" aria-hidden />
      {description && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          {description}
        </p>
      )}
      {meta && meta.length > 0 && (
        <dl className="mt-6 flex flex-wrap gap-3">
          {meta.map((m) => (
            <div
              key={m.nama}
              className="rounded-xl border border-line bg-surface px-4 py-2.5"
            >
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-secondary">
                {m.nama}
              </dt>
              <dd className="font-serif text-lg font-bold text-ink">
                {typeof m.nilai === "number" ? formatCompactNumber(m.nilai) : m.nilai}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}
