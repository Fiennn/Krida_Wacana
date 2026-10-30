/** Skeleton global saat menunggu data (loading state). */
export default function Loading() {
  return (
    <div className="animate-fade-in">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-navy via-navy-royal to-navy-dark px-4 pb-16 pt-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="h-5 w-56 animate-pulse rounded-full bg-white/10" />
          <div className="mt-6 h-10 w-2/3 animate-pulse rounded-xl bg-white/10 sm:h-14" />
          <div className="mt-3 h-10 w-1/3 animate-pulse rounded-xl bg-white/10 sm:h-14" />
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass h-20 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Kartu skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
          <div className="h-11 w-full max-w-xl animate-pulse rounded-full bg-surface-muted" />
          <div className="mt-4 flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-surface-muted" />
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-line">
                <div className="h-36 w-full animate-pulse bg-surface-muted" />
                <div className="p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
