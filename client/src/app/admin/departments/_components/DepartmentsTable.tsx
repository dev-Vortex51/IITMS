import { Building2, Eye, Trash2, UserPlus, Users } from "lucide-react";
import { ActionMenu, EmptyState } from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DepartmentsTableProps {
  departments: any[];
  onAssign: (department: any) => void;
  onToggleStatus: (department: any) => void;
  onHardDelete: (department: any) => void;
  isAssigning: boolean;
  isDeleting: boolean;
}

export default function DepartmentsTable({
  departments,
  onAssign,
  onToggleStatus,
  onHardDelete,
  isAssigning,
  isDeleting,
}: DepartmentsTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Department Directory</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Review department status, coordinators, and quick actions.
        </p>
      </div>

      {departments.length === 0 ? (
        <EmptyState
          title="No departments found"
          description="Try adjusting your search or filters."
          icon={<Building2 className="h-10 w-10 text-muted-foreground/60" />}
          className="py-12"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Coordinator</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept: any) => {
              const coordinatorCount = dept.coordinators?.length || 0;
              return (
                <TableRow key={dept.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-full bg-muted p-1.5">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{dept.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {dept.faculty?.code || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{dept.studentCount || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dept.isActive ? "secondary" : "outline"}>
                      {dept.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {coordinatorCount > 0 ? `${coordinatorCount} assigned` : "Unassigned"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <ActionMenu
                        items={[
                          {
                            label: "View details",
                            href: `/admin/departments/${dept.id}`,
                            icon: <Eye className="h-3.5 w-3.5" />,
                          },
                          {
                            label: "Assign coordinator",
                            onClick: () => onAssign(dept),
                            icon: <UserPlus className="h-3.5 w-3.5" />,
                            disabled: isAssigning,
                          },
                          {
                            label: dept.isActive ? "Deactivate" : "Activate",
                            onClick: () => onToggleStatus(dept),
                          },
                          ...(!dept.isActive
                            ? [
                                {
                                  label: "Permanently delete",
                                  onClick: () => onHardDelete(dept),
                                  icon: <Trash2 className="h-3.5 w-3.5" />,
                                  destructive: true,
                                  disabled: isDeleting,
                                },
                              ]
                            : []),
                        ]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
