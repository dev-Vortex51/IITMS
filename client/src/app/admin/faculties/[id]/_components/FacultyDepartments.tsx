import Link from "next/link";
import { EmptyState, LoadingSectionSkeleton } from "@/components/design-system";
import { Building, ChevronRight } from "lucide-react";

export default function FacultyDepartments({
  isLoading,
  departments,
}: {
  isLoading: boolean;
  departments: any[];
}) {
  return (
    <div className="space-y-3">
      {isLoading ? (
        <LoadingSectionSkeleton />
      ) : departments.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {departments.map((dept: any) => (
            <Link
              key={dept.id}
              href={`/admin/departments/${dept.id}`}
              className="group block"
            >
              <div className="flex items-center gap-4 rounded-md border border-border bg-background p-4 transition-colors hover:bg-muted/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Building className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {dept.name}
                  </p>
                  <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {dept.code}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Departments Found"
          description="There are currently no departments assigned to this faculty."
          icon={<Building className="h-10 w-10 text-muted-foreground/30" />}
        />
      )}
    </div>
  );
}
