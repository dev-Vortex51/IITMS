import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Building, ChevronRight } from "lucide-react";

export default function FacultyDepartments({
  isLoading,
  departments,
}: {
  isLoading: boolean;
  departments: any[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 pb-4 border-b border-border/40">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building className="h-5 w-5 text-muted-foreground" />
          Associated Departments
        </h2>
        <p className="text-sm text-muted-foreground">
          Showing {departments.length} department
          {departments.length !== 1 ? "s" : ""} in this faculty.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : departments.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {departments.map((dept: any) => (
            <Link
              key={dept.id}
              href={`/admin/departments/${dept.id}`}
              className="group block"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {dept.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">
                    {dept.code}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-all shrink-0 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-transparent shadow-none py-12 flex flex-col items-center justify-center text-center px-4">
          <Building className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            No Departments Found
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
            There are currently no departments assigned to this faculty.
          </p>
        </Card>
      )}
    </div>
  );
}
