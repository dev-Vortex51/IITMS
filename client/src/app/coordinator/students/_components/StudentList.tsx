import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingCard } from "@/components/ui/loading";
import { Users, Briefcase, UserCheck, Eye } from "lucide-react";

interface StudentListProps {
  students: any[];
  isLoading: boolean;
  searchQuery: string;
}

const getPlacementStatus = (student: any) => {
  if (!student.placement)
    return { text: "No Placement", variant: "secondary" as const };
  const status = student.placement.status || "pending";
  const variants: Record<string, { text: string; variant: any }> = {
    approved: { text: "Approved", variant: "success" },
    pending: { text: "Pending", variant: "warning" },
    rejected: { text: "Rejected", variant: "destructive" },
  };
  return variants[status] || { text: "Unknown", variant: "secondary" };
};

export function StudentList({
  students,
  isLoading,
  searchQuery,
}: StudentListProps) {
  if (isLoading) return <LoadingCard />;

  if (students.length === 0) {
    return (
      <Card className="border-dashed shadow-none bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">
            {searchQuery ? "No Students Found" : "No Students Yet"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? "Try adjusting your search criteria."
              : "Students registered to your department will appear here."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="text-lg">
          Students List ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 p-0 sm:p-6">
        <div className="space-y-3 px-4 sm:px-0 pb-4 sm:pb-0">
          {students.map((student) => {
            const status = getPlacementStatus(student);
            const hasSupervisors =
              student.placement?.departmentalSupervisor ||
              student.placement?.industrialSupervisor;

            return (
              <div
                key={student.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border rounded-xl hover:bg-accent/5 transition-colors"
              >
                {/* User Info */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-primary/10 shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {student.name || "N/A"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-muted-foreground">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        {student.matricNumber || "N/A"}
                      </span>
                      {student.department && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate max-w-[200px]">
                            {typeof student.department === "object"
                              ? student.department.name
                              : student.department}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 mt-1 lg:mt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {student.placement && (
                      <Badge
                        variant="outline"
                        className="gap-1.5 bg-background"
                      >
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[120px]">
                          {typeof student.placement === "object"
                            ? student.placement.companyName
                            : "Placement"}
                        </span>
                      </Badge>
                    )}
                    {hasSupervisors && (
                      <Badge
                        variant="outline"
                        className="gap-1.5 bg-background"
                      >
                        <UserCheck className="h-3 w-3 text-blue-500" />{" "}
                        Supervisors
                      </Badge>
                    )}
                    <Badge variant={status.variant as any}>{status.text}</Badge>
                  </div>

                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="ml-auto lg:ml-0 shrink-0"
                  >
                    <Link href={`/coordinator/students/${student.id}`}>
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
