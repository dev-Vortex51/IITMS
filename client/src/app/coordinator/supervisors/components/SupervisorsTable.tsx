import { Group, Text } from "@mantine/core";
import { Badge } from "@/components/ui/badge";
import {
  ActionMenu,
  AtlassianTable,
  type AtlassianTableColumn,
} from "@/components/design-system";
import { Building, Building2, Eye, Users } from "lucide-react";

interface SupervisorsTableProps {
  supervisors: any[];
  isLoading: boolean;
  type: "academic" | "industrial";
}

const getStatusTone = (status: string) => {
  if (status === "active") return "bg-emerald-100 text-emerald-800";
  if (status === "inactive") return "bg-slate-200 text-slate-700";
  return "bg-slate-200 text-slate-700";
};

export function SupervisorsTable({
  supervisors,
  isLoading,
  type,
}: SupervisorsTableProps) {
  const isAcademic = type === "academic";

  const columns: AtlassianTableColumn<any>[] = [
    {
      id: "name",
      header: "Supervisor",
      width: 320,
      sortable: true,
      sortAccessor: (supervisor) => (supervisor.name || "").toLowerCase(),
      render: (supervisor) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-muted p-1.5">
            {isAcademic ? (
              <Building className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <Text fw={600} size="sm">
              {supervisor.name || "N/A"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      id: "entity",
      header: isAcademic ? "Department" : "Company",
      sortable: true,
      sortAccessor: (supervisor) =>
        (
          isAcademic
            ? typeof supervisor.department === "object"
              ? supervisor.department?.name
              : supervisor.department
            : supervisor.companyName
        )?.toLowerCase() || "",
      render: (supervisor) => {
        const value = isAcademic
          ? typeof supervisor.department === "object"
            ? supervisor.department?.name
            : supervisor.department || "No department linked"
          : supervisor.companyName || "N/A";
        return <Text size="sm">{value}</Text>;
      },
    },
    {
      id: "students",
      header: "Students",
      width: 120,
      sortable: true,
      sortAccessor: (supervisor) => supervisor.students?.length || 0,
      render: (supervisor) => (
        <Text size="sm" className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          {supervisor.students?.length || 0}
        </Text>
      ),
    },
    {
      id: "status",
      header: "Status",
      width: 120,
      sortable: true,
      sortAccessor: (supervisor) => supervisor.status || "",
      render: (supervisor) => (
        <Badge
          variant="secondary"
          className={`capitalize ${getStatusTone(supervisor.status || "inactive")}`}
        >
          {supervisor.status || "inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      width: 90,
      align: "right",
      render: (supervisor) => (
        <Group justify="flex-end">
          <ActionMenu
            items={[
              {
                label: "View profile",
                href: `/coordinator/supervisors/${supervisor.id}`,
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
      title="Supervisors Directory"
      subtitle={
        isAcademic
          ? "Departmental and academic supervisors available for student oversight."
          : "Industry partner supervisors available for placement mentorship."
      }
      data={supervisors}
      columns={columns}
      rowKey={(supervisor) => supervisor.id}
      loading={isLoading}
      emptyTitle={`No ${type} supervisors found`}
      emptyDescription="Try adjusting your search or status filters."
    />
  );
}
