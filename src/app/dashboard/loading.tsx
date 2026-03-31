export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Section header skeleton */}
      <div className="mb-6">
        <div className="h-7 w-36 rounded-lg bg-white/[0.10]" />
        <div className="mt-2 h-4 w-64 rounded-md bg-white/[0.06]" />
      </div>

      {/* New Analysis card skeleton */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-6">
        {/* App name input */}
        <div className="mb-5">
          <div className="h-4 w-20 rounded bg-white/[0.08] mb-2" />
          <div className="h-10 w-full rounded-lg bg-white/[0.06]" />
        </div>

        {/* Tab bar */}
        <div className="mb-5 flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-white/[0.06]" />
          <div className="h-9 w-24 rounded-lg bg-white/[0.06]" />
          <div className="h-9 w-24 rounded-lg bg-white/[0.06]" />
        </div>

        {/* Content area */}
        <div className="h-32 rounded-lg bg-white/[0.04] border border-dashed border-white/[0.08]" />

        {/* Button */}
        <div className="mt-5 h-11 w-40 rounded-lg bg-white/[0.10]" />
      </div>

      {/* Separator */}
      <div className="my-8 h-px bg-white/[0.06]" />

      {/* Recent Reports header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="h-5 w-32 rounded-md bg-white/[0.10]" />
        <div className="h-3 w-16 rounded bg-white/[0.06]" />
      </div>

      {/* Report card skeletons */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md px-4 py-3.5"
          >
            {/* Score circle */}
            <div className="h-10 w-10 shrink-0 rounded-full bg-white/[0.10]" />
            {/* Text */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 rounded bg-white/[0.08]" />
              <div className="h-3 w-48 rounded bg-white/[0.06]" />
            </div>
            {/* Arrow */}
            <div className="h-4 w-4 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}
