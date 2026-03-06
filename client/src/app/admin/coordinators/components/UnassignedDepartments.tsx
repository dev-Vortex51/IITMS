import Link from "next/link";
import { Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UnassignedDepartmentsProps {
  departments: any[];
}

export function UnassignedDepartments({ departments }: UnassignedDepartmentsProps) {
  if (!departments.length) return null;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Pending Assignments</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Departments currently without coordinator assignment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {departments.map((department) => (
            <div
              key={department.id}
              className="flex flex-col items-start justify-between gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                <div className="shrink-0 rounded-lg bg-muted p-1.5 sm:p-2">
                  <Building className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground sm:text-base">{department.name}</p>
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">
                    {typeof department.faculty === "object" ? department.faculty.name : "Faculty"} • Code: {department.code}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full text-xs sm:w-auto sm:text-sm">
                <Link href={`/admin/departments/${department.id}`}>
                  <span className="hidden sm:inline">Assign Coordinator</span>
                  <span className="sm:hidden">Assign</span>
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
