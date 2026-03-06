import { DashboardMetricsGrid } from "@/components/design-system";

interface SystemOverviewStatsProps {
  stats: {
    totalFaculties: number;
    totalDepartments: number;
    totalStudents: number;
    totalPlacements: number;
    approvedPlacements: number;
  };
}

export function SystemOverviewStats({ stats }: SystemOverviewStatsProps) {
  return (
    <DashboardMetricsGrid
      items={[
        {
          label: "Total Faculties",
          value: stats.totalFaculties,
          hint: "Institution-wide faculties",
          trend: "up",
        },
        {
          label: "Total Departments",
          value: stats.totalDepartments,
          hint: "Departments across faculties",
          trend: "up",
        },
        {
          label: "Total Students",
          value: stats.totalStudents,
          hint: "All student records",
          trend: "up",
        },
        {
          label: "Approved Placements",
          value: `${stats.approvedPlacements} / ${stats.totalPlacements}`,
          hint: "Placement approval progress",
          trend: "neutral",
        },
      ]}
    />
  );
}
