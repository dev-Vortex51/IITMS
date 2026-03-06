import { DashboardMetricsGrid } from "@/components/design-system";

export function SupervisorMetrics({ metrics }: { metrics: any }) {
  const utilization =
    metrics.capacity > 0
      ? `${Math.round((metrics.students / metrics.capacity) * 100)}%`
      : "0%";

  const items = [
    {
      label: "Assigned Students",
      value: metrics.students,
      hint: "Currently assigned mentees",
      trend: "up" as const,
    },
    {
      label: "Capacity",
      value: metrics.capacity,
      hint: "Maximum supported assignments",
      trend: "neutral" as const,
    },
    {
      label: "Utilization",
      value: utilization,
      hint: "Assigned out of capacity",
      trend: "up" as const,
    },
    {
      label: "Status",
      value: metrics.isActive ? "Active" : "Inactive",
      hint: "Account activity state",
      trend: "neutral" as const,
    },
  ];

  return <DashboardMetricsGrid items={items} />;
}
