export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Section header skeleton */}
      <div className="mb-6">
        <div className="h-7 w-36 rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-64 rounded-md bg-gray-100" />
      </div>

      {/* New Analysis card skeleton */}
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        {/* App name input */}
        <div className="mb-5">
          <div className="h-4 w-20 rounded bg-gray-200 mb-2" />
          <div className="h-10 w-full rounded-lg bg-gray-100" />
        </div>

        {/* Tab bar */}
        <div className="mb-5 flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-gray-100" />
          <div className="h-9 w-24 rounded-lg bg-gray-100" />
          <div className="h-9 w-24 rounded-lg bg-gray-100" />
        </div>

        {/* Content area */}
        <div className="h-32 rounded-lg bg-white border border-dashed border-gray-200" />

        {/* Button */}
        <div className="mt-5 h-11 w-40 rounded-lg bg-gray-200" />
      </div>

      {/* Separator */}
      <div className="my-8 h-px bg-gray-100" />

      {/* Recent Reports header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="h-5 w-32 rounded-md bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-100" />
      </div>

      {/* Report card skeletons */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-gray-200/60 bg-white px-4 py-3.5"
          >
            {/* Score circle */}
            <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
            {/* Text */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 rounded bg-gray-200" />
              <div className="h-3 w-48 rounded bg-gray-100" />
            </div>
            {/* Arrow */}
            <div className="h-4 w-4 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
