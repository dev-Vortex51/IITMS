import { ArrowRight, Eye, User } from "lucide-react";
import {
  ActionMenu,
  AtlassianTable,
} from "@/components/design-system";
import type { Student } from "../types";
import { formatStudentName, getStudentId } from "../utils/logbook-ui";

interface LogbookStudentTableProps {
  students: Student[];
  searchQuery: string;
  onSelectStudent: (student: Student) => void;
}

export function LogbookStudentTable({
  students,
  searchQuery,
  onSelectStudent,
}: LogbookStudentTableProps) {
  return (
    <AtlassianTable
      title="Assigned Students"
      subtitle={`${students.length} student${students.length === 1 ? "" : "s"}`}
      data={students}
      rowKey={(student) => getStudentId(student)}
      columns={[
        {
          id: "student",
          header: "Student",
          sortable: true,
          sortAccessor: (student) => formatStudentName(student),
          render: (student) => (
            <div className="flex items-center gap-2.5">
              <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {formatStudentName(student)}
                </p>
              </div>
            </div>
          ),
        },
        {
          id: "matricNumber",
          header: "Matric Number",
          sortable: true,
          sortAccessor: (student) => student.matricNumber || "",
          render: (student) => (
            <span className="text-sm text-foreground">{student.matricNumber || "N/A"}</span>
          ),
        },
        {
          id: "pendingReview",
          header: "Pending",
          align: "right",
          sortable: true,
          sortAccessor: (student) => student.pendingReview || 0,
          render: (student) => (
            <span className="text-sm font-medium text-foreground">{student.pendingReview || 0}</span>
          ),
        },
        {
          id: "approved",
          header: "Approved",
          align: "right",
          sortable: true,
          sortAccessor: (student) => student.approved || 0,
          render: (student) => (
            <span className="text-sm font-medium text-foreground">{student.approved || 0}</span>
          ),
        },
        {
          id: "rejected",
          header: "Rejected",
          align: "right",
          sortable: true,
          sortAccessor: (student) => student.rejected || 0,
          render: (student) => (
            <span className="text-sm font-medium text-foreground">{student.rejected || 0}</span>
          ),
        },
        {
          id: "actions",
          header: "",
          align: "right",
          width: 56,
          render: (student) => (
            <ActionMenu
              items={[
                {
                  label: "View Logbooks",
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => onSelectStudent(student),
                },
                {
                  label: "Open Student",
                  icon: <ArrowRight className="h-3.5 w-3.5" />,
                  href: `/d-supervisor/students/${getStudentId(student)}`,
                },
              ]}
            />
          ),
        },
      ]}
      emptyTitle={searchQuery ? "No students found" : "No students assigned"}
      emptyDescription={
        searchQuery
          ? "Try adjusting your search query."
          : "Students will appear here once assignments are available."
      }
      emptyIcon={<User className="h-6 w-6 text-accent-foreground" />}
    />
  );
}
