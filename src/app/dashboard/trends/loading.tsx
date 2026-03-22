import { Skeleton } from "@/components/ui/skeleton";

export default function TrendsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="mb-2 h-8 w-32" />
      <Skeleton className="mb-6 h-4 w-64" />
      <Skeleton className="mb-4 h-72 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}
