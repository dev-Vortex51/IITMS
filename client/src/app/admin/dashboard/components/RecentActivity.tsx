import { Building, School } from "lucide-react";
import { EmptyState, SectionCard } from "@/components/design-system";

interface RecentActivityProps {
  faculties: any[];
  departments: any[];
}

export function RecentActivity({
  faculties,
  departments,
}: RecentActivityProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <SectionCard title="Recent Faculties">
        {faculties.length > 0 ? (
          <div className="space-y-3">
            {faculties.slice(0, 5).map((faculty) => (
              <div
                key={faculty.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/20"
              >
                <div>
                  <p className="text-sm font-medium">{faculty.name}</p>
                  <p className="text-xs text-muted-foreground">Code: {faculty.code}</p>
                </div>
                <div className="rounded-md border p-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No faculties yet"
            description="New faculties will appear here once created."
          />
        )}
      </SectionCard>

      <SectionCard title="Recent Departments">
        {departments.length > 0 ? (
          <div className="space-y-3">
            {departments.slice(0, 5).map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/20"
              >
                <div>
                  <p className="text-sm font-medium">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {typeof dept.faculty === "object" ? dept.faculty.name : "Faculty"}
                  </p>
                </div>
                <div className="rounded-md border p-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No departments yet"
            description="New departments will appear here once created."
          />
        )}
      </SectionCard>
    </div>
  );
}
