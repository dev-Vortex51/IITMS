"use client";

import { useEffect } from "react";
import {
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DashboardDonutChart,
  DashboardTrendLineChart,
  LoadingPage,
  ErrorLocalState,
  DashboardChartCard,
  DashboardMetricsGrid,
  DashboardWelcomeBanner,
} from "@/components/design-system";
import { useAdminDashboardData } from "./hooks/useAdminDashboardData";
import { InlineQuickActions } from "./components/InlineQuickActions";

const number = new Intl.NumberFormat("en-US");

export default function AdminDashboardPage() {
  useEffect(() => {
    document.title = "Admin Dashboard | ITMS";
  }, []);

  const { stats, chartData, isLoading, error } = useAdminDashboardData();

  if (isLoading) {
    return <LoadingPage label="Loading dashboard..." />;
  }

  if (error) {
    return (
      <ErrorLocalState
        title="Unable to load dashboard data"
        message={error.message || "An unexpected error occurred."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const overviewCards = [
    {
      label: "Faculties",
      value: number.format(stats.totalFaculties),
      change: "Registered faculties",
      trend: "up" as const,
    },
    {
      label: "Departments",
      value: number.format(stats.totalDepartments),
      change: "Active departments",
      trend: "up" as const,
    },
    {
      label: "Students",
      value: number.format(stats.totalStudents),
      change: "Total registered students",
      trend: "neutral" as const,
    },
    {
      label: "Active Placements",
      value: number.format(stats.activePlacements),
      change: "Approved placements",
      trend: "neutral" as const,
    },
  ];

  const lineData =
    chartData.departments.length > 0
      ? chartData.departments.map((dept: { name: string; students: number }) => ({
          name: dept.name,
          value: dept.students,
        }))
      : [
          { name: "Mon", value: 5 },
          { name: "Tue", value: 9 },
          { name: "Wed", value: 7 },
          { name: "Thu", value: 12 },
          { name: "Fri", value: 10 },
        ];

  const barData =
    chartData.placements.length > 0
      ? chartData.placements
      : [
          { name: "Approved", value: 0 },
          { name: "Pending", value: 0 },
          { name: "Rejected", value: 0 },
        ];

  const pendingPlacementsCount =
    chartData.placements.find((item) => item.name === "Pending")?.value || 0;

  return (
    <div className="space-y-4 md:space-y-5">
      <h1 className="text-2xl font-semibold text-foreground">Overview</h1>

      <DashboardWelcomeBanner
        title="Welcome back, Admin!"
        description="Monitor faculties, departments, students, and placement activity from one overview."
        action={
          <Button asChild className="h-9">
            <Link href="/admin/invitations">
              <Download className="mr-2 h-4 w-4" />
              Manage Invitations
            </Link>
          </Button>
        }
      />

      <DashboardMetricsGrid items={overviewCards} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <DashboardChartCard
            title="Students by Department"
            badge="Overview"
            controls={
              <span className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">
                Trend View
              </span>
            }
          >
            <DashboardTrendLineChart data={lineData} xKey="name" yKey="value" />
          </DashboardChartCard>

          <DashboardChartCard
            title="Placement Status Distribution"
            badge="Overview"
            controls={
              <span className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">
                Approved/Pending/Rejected
              </span>
            }
          >
            <DashboardDonutChart
              data={barData.map((entry) => ({
                ...entry,
                color:
                  entry.name === "Approved"
                    ? "#4f62c7"
                    : entry.name === "Pending"
                      ? "#7486e2"
                      : "#c4cbf7",
              }))}
              nameKey="name"
              valueKey="value"
            />
          </DashboardChartCard>
        </div>

        <div className="lg:col-span-1">
          <InlineQuickActions
            className="lg:sticky lg:top-24 lg:max-w-[320px]"
            pendingPlacementsCount={pendingPlacementsCount}
          />
        </div>
      </section>
    </div>
  );
}
