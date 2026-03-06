import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  GraduationCap,
  Hash,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  student: any;
  studentId: string;
  placement?: any;
}

export function StudentProfileHeader({ student, studentId, placement }: Props) {
  const fullName =
    student.user?.firstName && student.user?.lastName
      ? `${student.user.firstName} ${student.user.lastName}`
      : "Student";
  const hasPlacement = Boolean(
    placement || student?.placement || student?.currentPlacement,
  );
  const hasDepartmental = Boolean(
    student.departmentalSupervisor || student.academicSupervisor,
  );
  const hasIndustrial = Boolean(student.industrialSupervisor);
  const supervisorsAssigned = [hasDepartmental, hasIndustrial].filter(Boolean).length;

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b border-border/60 bg-muted/20 px-4 py-3 md:px-5 md:py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-background p-2.5 border border-border/60">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground truncate">
                {fullName}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-muted-foreground font-mono text-sm">
                <Hash className="h-3.5 w-3.5" />
                {student.matricNumber || "No Matric Number"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 md:px-5 md:py-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={
                hasPlacement
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-700"
              }
            >
              {hasPlacement ? "Placement Submitted" : "No Placement"}
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              {supervisorsAssigned}/2 Supervisors Assigned
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/coordinator/students/${studentId}/placement`}>
                <Briefcase className="h-4 w-4 mr-2" />
                Manage Placement
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/coordinator/students/${studentId}/supervisors`}>
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Supervisors
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
