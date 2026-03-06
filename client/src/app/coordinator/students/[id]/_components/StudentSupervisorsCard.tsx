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
import { Separator } from "@/components/ui/separator";

export function StudentSupervisorsCard({
  student,
  placement,
  studentId,
}: {
  student: any;
  placement: any;
  studentId: string;
}) {
  const academicSupervisor =
    student?.departmentalSupervisor || student?.academicSupervisor;

  const getSupervisorName = (supervisor: any) => {
    if (!supervisor) return "Not Assigned";
    return typeof supervisor === "object" ? supervisor.name : "Assigned";
  };

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10">
            <UserCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Supervisors</CardTitle>
            <CardDescription>
              Departmental and industrial oversight
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border border-border/60 overflow-hidden">
          <SupervisorRow
            title="Departmental Supervisor"
            name={getSupervisorName(academicSupervisor)}
            isAssigned={!!academicSupervisor}
          />
          <Separator />
          <SupervisorRow
            title="Industrial Supervisor"
            name={getSupervisorName(student?.industrialSupervisor)}
            isAssigned={!!student?.industrialSupervisor}
          />
        </div>

        {placement ? (
          <Button asChild variant="outline" className="w-full sm:w-auto mt-4">
            <Link href={`/coordinator/students/${studentId}/supervisors`}>
              Manage Supervisors
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SupervisorRow({
  title,
  name,
  isAssigned,
}: {
  title: string;
  name: string;
  isAssigned: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-[220px_1fr_auto] md:items-center">
      <div>
        <Label className="text-muted-foreground text-xs uppercase tracking-wider">
          {title}
        </Label>
      </div>
      <p className="font-medium text-sm">{name}</p>
      <div className="md:justify-self-end">
        <Badge
          variant="secondary"
          className={isAssigned ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}
        >
          {isAssigned ? "Assigned" : "Unassigned"}
        </Badge>
      </div>
    </div>
  );
}
