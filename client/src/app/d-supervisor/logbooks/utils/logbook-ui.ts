import type {
  Logbook,
  LogbookStatusBadge,
  LogbookReview,
  Student,
} from "../types";

export function formatStudentName(student?: Student | null) {
  if (!student) return "Student";

  if (student.user) {
    const first = student.user.firstName ?? "";
    const last = student.user.lastName ?? "";
    return `${first} ${last}`.trim() || "Student";
  }

  return `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "Student";
}

export function getStudentId(student: Student) {
  return student.id || student._id || student.matricNumber;
}

export function getStatusBadge(logbook: Logbook): LogbookStatusBadge {
  const status = logbook.departmentalReview?.status || logbook.status;
  const config: Record<string, LogbookStatusBadge> = {
    submitted: { variant: "outline", text: "Pending Review" },
    reviewed: { variant: "secondary", text: "Reviewed" },
    approved: { variant: "default", text: "Approved" },
    rejected: { variant: "destructive", text: "Rejected" },
    draft: { variant: "secondary", text: "Draft" },
  };

  return config[status || ""] || { variant: "secondary", text: "Unknown" };
}

export function getDepartmentalReview(logbook: Logbook): LogbookReview | undefined {
  return logbook.reviews?.find((review) => review.supervisorType === "departmental");
}
