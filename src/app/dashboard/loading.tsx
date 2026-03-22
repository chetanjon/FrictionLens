export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Section header skeleton */}
      <div className="mb-6">
        <div className="h-7 w-36 rounded-lg bg-slate-200/70" />
        <div className="mt-2 h-4 w-64 rounded-md bg-slate-100" />
      </div>

      {/* New Analysis card skeleton */}
      <div className="rounded-2xl border border-slate-200/60 bg-white/65 p-6 backdrop-blur-xl">
        {/* App name input */}
        <div className="mb-5">
          <div className="h-4 w-20 rounded bg-slate-200/60 mb-2" />
          <div className="h-10 w-full rounded-lg bg-slate-100" />
        </div>

        {/* Tab bar */}
        <div className="mb-5 flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-slate-100" />
          <div className="h-9 w-24 rounded-lg bg-slate-100" />
          <div className="h-9 w-24 rounded-lg bg-slate-100" />
        </div>

        {/* Content area */}
        <div className="h-32 rounded-lg bg-slate-50 border border-dashed border-slate-200" />

        {/* Button */}
        <div className="mt-5 h-11 w-40 rounded-lg bg-slate-200/70" />
      </div>

      {/* Separator */}
      <div className="my-8 h-px bg-slate-200" />

      {/* Recent Reports header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="h-5 w-32 rounded-md bg-slate-200/70" />
        <div className="h-3 w-16 rounded bg-slate-100" />
      </div>

      {/* Report card skeletons */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white/65 px-4 py-3.5 backdrop-blur-xl"
          >
            {/* Score circle */}
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200/70" />
            {/* Text */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 rounded bg-slate-200/60" />
              <div className="h-3 w-48 rounded bg-slate-100" />
            </div>
            {/* Arrow */}
            <div className="h-4 w-4 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
