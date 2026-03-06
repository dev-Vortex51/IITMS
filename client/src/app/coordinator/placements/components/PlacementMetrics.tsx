import { DashboardMetricsGrid } from "@/components/design-system";

export function PlacementMetrics({ metrics }: { metrics: any }) {
  const total = metrics.total || 0;
  const approvedRate =
    total > 0 ? `${Math.round((metrics.approved / total) * 100)}%` : "0%";

  const items = [
    {
      label: "Total Placements",
      value: metrics.total,
      hint: "All submitted placements",
      trend: "neutral" as const,
    },
    {
      label: "Approved",
      value: metrics.approved,
      hint: "Approved by coordinator",
      trend: "up" as const,
    },
    {
      label: "Pending",
      value: metrics.pending,
      hint: "Awaiting review",
      trend: "up" as const,
    },
    {
      label: "Approval Rate",
      value: approvedRate,
      hint: "Approved out of total",
      trend: "up" as const,
    },
  ];

  return <DashboardMetricsGrid items={items} />;
}
