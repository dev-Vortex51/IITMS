import { Skeleton } from "@/components/ui/skeleton";

interface LoadingTableSkeletonProps {
  rows?: number;
}

export function LoadingTableSkeleton({ rows = 5 }: LoadingTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="grid grid-cols-5 gap-2 border-b p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
