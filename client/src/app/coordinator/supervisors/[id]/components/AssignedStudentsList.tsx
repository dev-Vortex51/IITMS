import { Group, Text } from "@mantine/core";
import {
  ActionMenu,
  AtlassianTable,
  type AtlassianTableColumn,
} from "@/components/design-system";
import { GraduationCap, Eye } from "lucide-react";

export function AssignedStudentsList({ students }: { students: any[] }) {
  const columns: AtlassianTableColumn<any>[] = [
    {
      id: "student",
      header: "Student",
      width: 320,
      sortable: true,
      sortAccessor: (student) => (student.name || "").toLowerCase(),
      render: (student) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-muted p-1.5">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          <Text fw={600} size="sm">
            {student.name || "Unknown Student"}
          </Text>
        </div>
      ),
    },
    {
      id: "matric",
      header: "Matric No.",
      width: 170,
      sortable: true,
      sortAccessor: (student) => (student.matricNumber || "").toLowerCase(),
      render: (student) => (
        <Text size="sm" ff="monospace">
          {student.matricNumber || "N/A"}
        </Text>
      ),
    },
    {
      id: "level",
      header: "Level",
      width: 120,
      sortable: true,
      sortAccessor: (student) => Number(student.level || 0),
      render: (student) => <Text size="sm">{student.level || "N/A"}</Text>,
    },
    {
      id: "actions",
      header: "Actions",
      width: 90,
      align: "right",
      render: (student) => (
        <Group justify="flex-end">
          <ActionMenu
            items={[
              {
                label: "View student",
                href: `/coordinator/students/${student.id}`,
                icon: <Eye className="h-3.5 w-3.5" />,
              },
            ]}
          />
        </Group>
      ),
    },
  ];

  return (
    <AtlassianTable
      title="Assigned Students"
      subtitle="Students currently under this supervisor's mentorship."
      data={students}
      columns={columns}
      rowKey={(student) => student.id}
      emptyTitle="No students assigned"
      emptyDescription="This supervisor currently has no active mentees."
    />
  );
}
