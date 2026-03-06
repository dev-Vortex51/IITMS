import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Logbook, Student } from "../types";

export function formatStudentName(student: Student | null | undefined) {
  const firstName = student?.user?.firstName || "";
  const lastName = student?.user?.lastName || "";
  return `${firstName} ${lastName}`.trim() || "Student";
}

export function getStudentId(student: Student) {
  return student.id || student._id || student.matricNumber;
}

export function getLogbookId(logbook: Logbook) {
  return logbook.id || logbook._id || `${logbook.weekNumber}-${logbook.startDate}`;
}

export function getStatusBadge(status?: string) {
  const variants = {
    submitted: {
      variant: "secondary" as const,
      icon: Clock,
      label: "Pending Review",
      className: undefined,
    },
    approved: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Reviewed",
      className: "bg-green-500 hover:bg-green-600",
    },
    rejected: {
      variant: "destructive" as const,
      icon: XCircle,
      label: "Reviewed",
      className: undefined,
    },
  };

  const config = variants[status as keyof typeof variants] || variants.submitted;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className || ""}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
