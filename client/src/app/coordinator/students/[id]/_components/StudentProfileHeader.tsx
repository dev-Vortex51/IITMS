import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, UserCheck } from "lucide-react";

interface Props {
  student: any;
  studentId: string;
}

export function StudentProfileHeader({ student, studentId }: Props) {
  const fullName =
    student.user?.firstName && student.user?.lastName
      ? `${student.user.firstName} ${student.user.lastName}`
      : "Student";

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <Button variant="outline" size="icon" asChild className="shrink-0 mt-1">
          <Link href="/coordinator/students">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {fullName}
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {student.matricNumber || "No Matric Number"}
          </p>
        </div>
      </div>

      {/* Quick Actions - Stack on mobile, row on tablet/desktop */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
        <Button asChild variant="outline" className="flex-1 md:flex-none">
          <Link href={`/coordinator/students/${studentId}/placement`}>
            <Briefcase className="h-4 w-4 mr-2" />
            Manage Placement
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 md:flex-none">
          <Link href={`/coordinator/students/${studentId}/supervisors`}>
            <UserCheck className="h-4 w-4 mr-2" />
            Assign Supervisors
          </Link>
        </Button>
      </div>
    </div>
  );
}
