import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users } from "lucide-react";

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
  const currentDeptSup =
    typeof student?.departmentalSupervisor === "object"
      ? student.departmentalSupervisor
      : null;
  const currentIndSup =
    typeof student?.industrialSupervisor === "object"
      ? student.industrialSupervisor
      : null;

  const deptDetails = getSupervisorDetails(currentDeptSup);
  const indDetails = getSupervisorDetails(currentIndSup);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AssignmentCard
        title="Academic Supervisor"
        icon={<Building className="h-5 w-5 text-primary" />}
        details={deptDetails}
        isActive={!!currentDeptSup}
        badgeText="Faculty-based"
      />
      <AssignmentCard
        title="Industrial Supervisor"
        icon={<Users className="h-5 w-5 text-primary" />}
        details={indDetails}
        isActive={!!currentIndSup}
      />
    </div>
  );
}

function AssignmentCard({ title, icon, details, isActive, badgeText }: any) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center space-y-0 gap-2">
        {icon}
        <CardTitle className="text-base">{title}</CardTitle>
        {badgeText && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded ml-auto">
            {badgeText}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isActive ? (
          <div>
            <p className="font-medium">{details.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {details.email}
            </p>
            <Badge variant="success" className="mt-2 text-xs">
              Assigned
            </Badge>
          </div>
        ) : (
          <p className="text-muted-foreground italic text-sm">Not assigned</p>
        )}
      </CardContent>
    </Card>
  );
}
