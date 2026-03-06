import { DashboardMetricsGrid } from "@/components/design-system";

interface StatsProps {
  stats: {
    total: number;
    withPlacement: number;
    withSupervisors: number;
    noPlacement: number;
  };
}

export function StudentStats({ stats }: StatsProps) {
  const placementRate =
    stats.total > 0 ? `${Math.round((stats.withPlacement / stats.total) * 100)}%` : "0%";

  const metrics = [
    {
      label: "Total Students",
      value: stats.total,
      hint: "Students in your department",
      trend: "neutral" as const,
    },
    {
      label: "With Placement",
      value: stats.withPlacement,
      hint: "Placement submitted",
      trend: "up" as const,
    },
    {
      label: "No Placement",
      value: stats.noPlacement,
      hint: "Require placement update",
      trend: "neutral" as const,
    },
    {
      label: "Placement Rate",
      value: placementRate,
      hint: "Placed out of total students",
      trend: "up" as const,
    },
  ];

  return <DashboardMetricsGrid items={metrics} />;
}
