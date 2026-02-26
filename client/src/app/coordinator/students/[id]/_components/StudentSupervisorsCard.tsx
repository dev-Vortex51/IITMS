import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserCheck } from "lucide-react";

export function StudentSupervisorsCard({
  student,
  placement,
  studentId,
}: {
  student: any;
  placement: any;
  studentId: string;
}) {
  const getSupervisorName = (supervisor: any) => {
    if (!supervisor) return "Not Assigned";
    return typeof supervisor === "object" ? supervisor.name : "Assigned";
  };

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10">
            <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Supervisors</CardTitle>
            <CardDescription>
              Departmental and industrial oversight
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SupervisorBox
            title="Departmental Supervisor"
            name={getSupervisorName(student?.departmentalSupervisor)}
            isAssigned={!!student?.departmentalSupervisor}
          />
          <SupervisorBox
            title="Industrial Supervisor"
            name={getSupervisorName(student?.industrialSupervisor)}
            isAssigned={!!student?.industrialSupervisor}
          />
        </div>

        {placement && (
          <Button asChild variant="outline" className="w-full sm:w-auto mt-6">
            <Link href={`/coordinator/students/${studentId}/supervisors`}>
              Manage Supervisors
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function SupervisorBox({
  title,
  name,
  isAssigned,
}: {
  title: string;
  name: string;
  isAssigned: boolean;
}) {
  return (
    <div className="p-4 border rounded-xl bg-card hover:bg-accent/5 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-muted-foreground text-xs uppercase tracking-wider">
          {title}
        </Label>
        {isAssigned && (
          <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">
            Assigned
          </Badge>
        )}
      </div>
      <p className="font-medium">{name}</p>
    </div>
  );
}
