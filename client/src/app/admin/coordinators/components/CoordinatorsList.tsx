import { Building2, Eye, Mail, UserCog } from "lucide-react";
import {
  ActionMenu,
  AtlassianTable,
  type AtlassianTableColumn,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";

interface CoordinatorsListProps {
  departments: any[];
  getCoordinatorInfo: (coordinatorId: string) => any;
}

export function CoordinatorsList({
  departments,
  getCoordinatorInfo,
}: CoordinatorsListProps) {
  const columns: AtlassianTableColumn<any>[] = [
    {
      id: "department",
      header: "Department",
      width: 320,
      sortable: true,
      sortAccessor: (department) => department.name?.toLowerCase() || "",
      render: (department) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-muted p-1.5">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{department.name}</p>
          </div>
        </div>
      ),
    },
    {
      id: "faculty",
      header: "Faculty",
      width: 120,
      sortable: true,
      sortAccessor: (department) => department.faculty?.code || "",
      render: (department) => (
        <span className="text-sm text-foreground">
          {typeof department.faculty === "object"
            ? department.faculty?.code || "N/A"
            : "N/A"}
        </span>
      ),
    },
    {
      id: "coordinator",
      header: "Coordinator",
      width: 360,
      sortable: true,
      sortAccessor: (department) => {
        const first = department.coordinators?.[0];
        const info = first ? getCoordinatorInfo(first) : null;
        return info?.email?.toLowerCase() || "";
      },
      render: (department) => {
        const firstCoordinatorId = department.coordinators?.[0];
        const coordinator = firstCoordinatorId
          ? getCoordinatorInfo(firstCoordinatorId)
          : null;
        return (
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              {coordinator
                ? `${coordinator.firstName || ""} ${coordinator.lastName || ""}`.trim()
                : "Coordinator"}
            </p>
            {coordinator?.email ? (
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {coordinator.email}
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "assignedCount",
      header: "Assignments",
      width: 130,
      align: "center",
      sortable: true,
      sortAccessor: (department) => department.coordinators?.length || 0,
      render: (department) => (
        <Badge variant="secondary" className="inline-flex items-center gap-1.5">
          <UserCog className="h-3.5 w-3.5" />
          {department.coordinators?.length || 0}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      width: 100,
      align: "right",
      render: (department) => (
        <div className="flex justify-end">
          <ActionMenu
            items={[
              {
                label: "View department",
                href: `/admin/departments/${department.id}`,
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
      title="Assigned Coordinators"
      subtitle="Departments currently mapped to coordinator accounts."
      data={departments}
      columns={columns}
      rowKey={(department) => department.id}
      emptyTitle="No coordinator assignments found"
      emptyDescription="Invite coordinators and assign them to departments."
      emptyIcon={<UserCog className="h-10 w-10 text-muted-foreground/50" />}
    />
  );
}
