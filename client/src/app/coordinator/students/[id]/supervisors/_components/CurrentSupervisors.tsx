import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Helper to safely extract name and email from complex supervisor objects
function getSupervisorDetails(supervisor: any) {
  if (!supervisor || typeof supervisor !== "object")
    return { name: "N/A", email: "N/A" };

  const name =
    supervisor.name ||
    (supervisor.user?.firstName && supervisor.user?.lastName
      ? `${supervisor.user.firstName} ${supervisor.user.lastName}`
      : "N/A");

  const email = supervisor.email || supervisor.user?.email || "N/A";

  return { name, email };
}

export function CurrentSupervisors({ student }: { student: any }) {
  const academicSupervisor =
    student?.departmentalSupervisor || student?.academicSupervisor;

  const currentDeptSup =
    typeof academicSupervisor === "object"
      ? academicSupervisor
      : null;
  const currentIndSup =
    typeof student?.industrialSupervisor === "object"
      ? student.industrialSupervisor
      : null;

  const deptDetails = getSupervisorDetails(currentDeptSup);
  const indDetails = getSupervisorDetails(currentIndSup);

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Current Assignments</CardTitle>
        <CardDescription>
          Review currently assigned supervisors before updating.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border border-border/60 overflow-hidden">
          <SupervisorRow
            title="Academic Supervisor"
            details={deptDetails}
            isAssigned={!!currentDeptSup}
            icon={<Building className="h-4 w-4" />}
          />
          <Separator />
          <SupervisorRow
            title="Industrial Supervisor"
            details={indDetails}
            isAssigned={!!currentIndSup}
            icon={<Users className="h-4 w-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SupervisorRow({
  title,
  details,
  isAssigned,
  icon,
}: {
  title: string;
  details: { name: string; email: string };
  isAssigned: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[220px_1fr_auto] md:items-center">
        <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          {title}
        </Label>
        <div className="min-w-0">
          <p className="font-medium text-sm">{details.name}</p>
          <p className="text-xs text-muted-foreground truncate">{details.email}</p>
        </div>
        <div className="md:justify-self-end">
          <Badge
            variant="secondary"
            className={isAssigned ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}
          >
            {isAssigned ? "Assigned" : "Unassigned"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
