import { AtlassianTable, type AtlassianTableColumn } from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export function SupervisorStudentsTable({ students }: { students: any[] }) {
  const columns: AtlassianTableColumn<any>[] = [
    {
      id: "student",
      header: "Student",
      width: 320,
      sortable: true,
      sortAccessor: (student) => student.name?.toLowerCase() || "",
      render: (student) => (
        <div>
          <p className="text-sm font-semibold text-foreground">{student.name || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{student.email || "No email"}</p>
        </div>
      ),
    },
    {
      id: "matric",
      header: "Matric Number",
      width: 160,
      sortable: true,
      sortAccessor: (student) => student.matricNumber || "",
      render: (student) => <span className="text-sm text-foreground">{student.matricNumber || "N/A"}</span>,
    },
    {
      id: "level",
      header: "Level",
      width: 120,
      align: "center",
      sortable: true,
      sortAccessor: (student) => Number(student.level || 0),
      render: (student) => <Badge variant="secondary">{student.level || "N/A"}</Badge>,
    },
    {
      id: "status",
      header: "Assignment Status",
      width: 180,
      align: "center",
      sortable: true,
      sortAccessor: (student) => student.assignmentStatus || "",
      render: (student) => (
        <Badge variant={student.assignmentStatus === "active" ? "secondary" : "outline"}>
          {student.assignmentStatus || "N/A"}
        </Badge>
      ),
    },
  ];

  return (
    <AtlassianTable
      title="Assigned Students"
      subtitle="Students currently assigned to this academic supervisor."
      data={students}
      columns={columns}
      rowKey={(student) => student.id}
      emptyTitle="No students assigned"
      emptyDescription="This supervisor has no active student assignments yet."
      emptyIcon={<Users className="h-10 w-10 text-muted-foreground/50" />}
    />
  );
}
