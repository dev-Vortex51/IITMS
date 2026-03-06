import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSectionSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm md:p-6">
      <Skeleton className="h-5 w-48" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
