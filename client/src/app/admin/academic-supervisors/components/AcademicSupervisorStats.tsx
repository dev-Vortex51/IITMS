import { DashboardMetricsGrid } from "@/components/design-system";

interface AcademicSupervisorStatsProps {
  total: number;
  available: number;
  studentsSupervised: number;
}

export function AcademicSupervisorStats({
  total,
  available,
  studentsSupervised,
}: AcademicSupervisorStatsProps) {
  const utilization = total > 0 ? `${Math.round((available / total) * 100)}%` : "0%";

  return (
    <DashboardMetricsGrid
      items={[
        {
          label: "Academic Supervisors",
          value: total,
          hint: "Active supervisor records",
          trend: "up",
        },
        {
          label: "Available",
          value: available,
          hint: "Can still take more students",
          trend: "up",
        },
        {
          label: "Students Supervised",
          value: studentsSupervised,
          hint: "Current supervision load",
          trend: "neutral",
        },
        {
          label: "Availability Rate",
          value: utilization,
          hint: "Available out of total",
          trend: "neutral",
        },
      ]}
    />
  );
}
