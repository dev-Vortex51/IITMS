import { DashboardMetricsGrid } from "@/components/design-system";

export function SupervisorMetrics({ stats }: { stats: any }) {
  const activeRate =
    stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : "0%";

  const metrics = [
    {
      label: "Total Supervisors",
      value: stats.total,
      hint: "Directory coverage",
      trend: "neutral" as const,
    },
    {
      label: "Academic",
      value: stats.academic,
      hint: "Department-aligned supervisors",
      trend: "up" as const,
    },
    {
      label: "Industrial",
      value: stats.industrial,
      hint: "Industry partner supervisors",
      trend: "up" as const,
    },
    {
      label: "Active Rate",
      value: activeRate,
      hint: "Active out of total",
      trend: "up" as const,
    },
  ];

  return <DashboardMetricsGrid items={metrics} />;
}
