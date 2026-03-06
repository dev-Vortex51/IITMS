import { DashboardMetricsGrid } from "@/components/design-system";

interface CoordinatorStatsProps {
  departmentsCount: number;
  assignedDepartmentsCount: number;
}

export function CoordinatorStats({
  departmentsCount,
  assignedDepartmentsCount,
}: CoordinatorStatsProps) {
  const unassignedCount = Math.max(departmentsCount - assignedDepartmentsCount, 0);
  const assignmentRate =
    departmentsCount > 0
      ? `${Math.round((assignedDepartmentsCount / departmentsCount) * 100)}%`
      : "0%";

  const cards = [
    {
      label: "Assigned Departments",
      value: assignedDepartmentsCount,
      hint: "Departments with coordinator coverage",
      trend: "up" as const,
    },
    {
      label: "Total Departments",
      value: departmentsCount,
      hint: "All departments in scope",
      trend: "up" as const,
    },
    {
      label: "Pending Assignment",
      value: unassignedCount,
      hint: "Needs coordinator assignment",
      trend: "neutral" as const,
    },
    {
      label: "Coverage Rate",
      value: assignmentRate,
      hint: "Assigned out of total",
      trend: "up" as const,
    },
  ];

  return <DashboardMetricsGrid items={cards} />;
}
