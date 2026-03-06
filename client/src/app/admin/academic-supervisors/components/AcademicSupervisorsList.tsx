import { Eye, GraduationCap, Phone, Users } from "lucide-react";
import {
  ActionMenu,
  AtlassianTable,
  type AtlassianTableColumn,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";

interface AcademicSupervisorsListProps {
  supervisors: any[];
}

export function AcademicSupervisorsList({
  supervisors,
}: AcademicSupervisorsListProps) {
  const columns: AtlassianTableColumn<any>[] = [
    {
      id: "supervisor",
      header: "Supervisor",
      width: 340,
      sortable: true,
      sortAccessor: (supervisor) =>
        `${supervisor.user?.firstName || ""} ${supervisor.user?.lastName || ""}`
          .trim()
          .toLowerCase(),
      render: (supervisor) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-muted p-1.5">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {supervisor.user?.firstName && supervisor.user?.lastName
                ? `${supervisor.user.firstName} ${supervisor.user.lastName}`
                : supervisor.name || "N/A"}
            </p>
            {supervisor.specialization ? (
              <p className="text-xs text-muted-foreground">
                {supervisor.specialization}
              </p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      width: 300,
      sortable: true,
      sortAccessor: (supervisor) => supervisor.user?.phone || "",
      render: (supervisor) => (
        <div className="space-y-1">
          {supervisor.user?.phone ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {supervisor.user.phone}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No phone</p>
          )}
        </div>
      ),
    },
    {
      id: "load",
      header: "Load",
      width: 150,
      align: "center",
      sortable: true,
      sortAccessor: (supervisor) => supervisor.assignedStudents?.length || 0,
      render: (supervisor) => (
        <Badge variant="secondary" className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {supervisor.assignedStudents?.length || 0} / {supervisor.maxStudents || 10}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      width: 140,
      align: "center",
      sortable: true,
      sortAccessor: (supervisor) =>
        (supervisor.assignedStudents?.length || 0) < (supervisor.maxStudents || 10)
          ? 1
          : 0,
      render: (supervisor) => {
        const available =
          (supervisor.assignedStudents?.length || 0) < (supervisor.maxStudents || 10);
        return (
          <Badge variant={available ? "secondary" : "outline"}>
            {available ? "Available" : "Full"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      width: 100,
      align: "right",
      render: (supervisor) => (
        <div className="flex justify-end">
          <ActionMenu
            items={[
              {
                label: "View profile",
                href: `/admin/academic-supervisors/${supervisor.id}`,
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
      title="Academic Supervisors"
      subtitle="Academic supervisors can supervise up to 10 students across departments."
      data={supervisors}
      columns={columns}
      rowKey={(supervisor) => supervisor.id}
      emptyTitle="No academic supervisors found"
      emptyDescription="Invite academic supervisors to start assigning student supervision."
      emptyIcon={<Users className="h-10 w-10 text-muted-foreground/50" />}
    />
  );
}
