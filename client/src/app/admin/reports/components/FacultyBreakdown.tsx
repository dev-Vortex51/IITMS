import { Building2, Eye, School, Users } from "lucide-react";
import {
  ActionMenu,
  AtlassianTable,
  type AtlassianTableColumn,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";

interface FacultyBreakdownProps {
  faculties: Array<{ id: string; name: string; code?: string }>;
  departments: any[];
}

export function FacultyBreakdown({
  faculties,
  departments,
}: FacultyBreakdownProps) {
  const rows = faculties.map((faculty) => {
    const facultyDepartments = departments.filter(
      (department) =>
        (typeof department.faculty === "object"
          ? department.faculty.id
          : department.faculty) === faculty.id,
    );

    const facultyStudentCount = facultyDepartments.reduce(
      (sum: number, department: any) => sum + (department.studentCount || 0),
      0,
    );

    return {
      ...faculty,
      departmentsCount: facultyDepartments.length,
      studentsCount: facultyStudentCount,
    };
  });

  const columns: AtlassianTableColumn<any>[] = [
    {
      id: "faculty",
      header: "Faculty",
      width: 360,
      sortable: true,
      sortAccessor: (row) => row.name.toLowerCase(),
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-muted p-1.5">
            <School className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{row.name}</p>
          </div>
        </div>
      ),
    },
    {
      id: "code",
      header: "Code",
      width: 100,
      sortable: true,
      sortAccessor: (row) => row.code || "",
      render: (row) => <span className="text-sm text-foreground">{row.code || "N/A"}</span>,
    },
    {
      id: "departmentsCount",
      header: "Departments",
      width: 140,
      align: "center",
      sortable: true,
      sortAccessor: (row) => row.departmentsCount,
      render: (row) => (
        <Badge variant="secondary" className="inline-flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          {row.departmentsCount}
        </Badge>
      ),
    },
    {
      id: "studentsCount",
      header: "Students",
      width: 140,
      align: "center",
      sortable: true,
      sortAccessor: (row) => row.studentsCount,
      render: (row) => (
        <Badge variant="secondary" className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {row.studentsCount}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      width: 100,
      align: "right",
      render: (row) => (
        <div className="flex justify-end">
          <ActionMenu
            items={[
              {
                label: "View faculty",
                href: `/admin/faculties/${row.id}`,
                icon: <Eye className="h-3.5 w-3.5" />,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <AtlassianTable
      title="Faculty Breakdown"
      subtitle="Department and student distribution by faculty."
      data={rows}
      columns={columns}
      rowKey={(row) => row.id}
      emptyTitle="No faculties found"
      emptyDescription="No faculty records match the selected filters."
      emptyIcon={<School className="h-10 w-10 text-muted-foreground/50" />}
    />
  );
}
