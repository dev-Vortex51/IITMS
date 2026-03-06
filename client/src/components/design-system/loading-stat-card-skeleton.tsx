import { Skeleton } from "@/components/ui/skeleton";

export function LoadingStatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm md:p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}
