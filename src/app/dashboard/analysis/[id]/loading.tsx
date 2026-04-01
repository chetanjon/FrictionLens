export default function AnalysisLoading() {
  return (
    <div className="animate-pulse">
      {/* Report nav skeleton */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-black/80">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 sm:px-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-lg bg-gray-100" />
          ))}
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-20 rounded-lg bg-gray-100" />
            <div className="h-8 w-8 rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Summary section skeleton */}
        <section className="space-y-6">
          {/* App header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gray-200" />
              <div className="space-y-2">
                <div className="h-6 w-40 rounded-lg bg-gray-200" />
                <div className="h-4 w-56 rounded bg-gray-100" />
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="h-3 w-16 rounded bg-gray-100 ml-auto" />
              <div className="h-10 w-16 rounded-lg bg-gray-200 ml-auto" />
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200/60 bg-white p-4 space-y-2"
              >
                <div className="h-3 w-16 rounded bg-gray-200 mx-auto" />
                <div className="h-8 w-12 rounded-lg bg-gray-200 mx-auto" />
                <div className="h-3 w-24 rounded bg-gray-100 mx-auto" />
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200/60 bg-white p-5">
              <div className="h-3 w-24 rounded bg-gray-200 mb-4" />
              <div className="mx-auto h-48 w-48 rounded-full bg-gray-100" />
            </div>
            <div className="rounded-xl border border-gray-200/60 bg-white p-5">
              <div className="h-3 w-28 rounded bg-gray-200 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-3 w-20 rounded bg-gray-100" />
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100" />
                    <div className="h-3 w-8 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* More section skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <section key={i} className="space-y-4">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-6 w-48 rounded-lg bg-gray-200" />
            <div className="rounded-xl border border-gray-200/60 bg-white p-6">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-4 rounded bg-gray-100" style={{ width: `${85 - j * 12}%` }} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
