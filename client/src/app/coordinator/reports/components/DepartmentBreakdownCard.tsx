import { Text } from "@mantine/core";
import { Building } from "lucide-react";
import {
  AtlassianTable,
  type AtlassianTableColumn,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";

interface DepartmentStat {
  id?: string;
  name: string;
  students: number;
  withPlacement: number;
}

interface DepartmentBreakdownCardProps {
  departmentStats: DepartmentStat[];
  isLoading?: boolean;
}

export function DepartmentBreakdownCard({
  departmentStats,
  isLoading = false,
}: DepartmentBreakdownCardProps) {
  const columns: AtlassianTableColumn<DepartmentStat>[] = [
    {
      id: "department",
      header: "Department",
      sortable: true,
      sortAccessor: (row) => row.name.toLowerCase(),
      render: (row) => <Text fw={600} size="sm">{row.name}</Text>,
    },
    {
      id: "students",
      header: "Students",
      width: 130,
      sortable: true,
      sortAccessor: (row) => row.students,
      render: (row) => <Text size="sm">{row.students}</Text>,
    },
    {
      id: "placement",
      header: "With Placement",
      width: 160,
      sortable: true,
      sortAccessor: (row) => row.withPlacement,
      render: (row) => <Text size="sm">{row.withPlacement}</Text>,
    },
    {
      id: "rate",
      header: "Placement Rate",
      width: 160,
      sortable: true,
      sortAccessor: (row) =>
        row.students > 0 ? Math.round((row.withPlacement / row.students) * 100) : 0,
      render: (row) => {
        const rate =
          row.students > 0
            ? `${Math.round((row.withPlacement / row.students) * 100)}%`
            : "0%";
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {rate}
          </Badge>
        );
      },
    },
  ];

  return (
    <AtlassianTable
      title="Department Breakdown"
      subtitle="Student distribution and placement adoption by department."
      data={departmentStats}
      columns={columns}
      rowKey={(row) => row.id || row.name}
      loading={isLoading}
      emptyTitle="No department data available"
      emptyDescription="Department analytics will appear when records are available."
      emptyIcon={<Building className="h-10 w-10 text-muted-foreground/50" />}
    />
  );
}
