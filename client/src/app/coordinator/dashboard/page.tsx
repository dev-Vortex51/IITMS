"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { useCoordinatorDashboard } from "./hooks/useCoordinatorDashboard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/design-system";
import {
  DashboardDonutChart,
  DashboardTrendLineChart,
  DashboardChartCard,
  DashboardMetricsGrid,
  DashboardWelcomeBanner,
  LoadingPage,
  SectionCard,
} from "@/components/design-system";
import { InlineQuickActions } from "./components/InlineQuickActions";

export default function CoordinatorDashboardPage() {
  useEffect(() => {
    document.title = "Coordinator Dashboard | ITMS";
  }, []);

  const { isLoading, stats, chartData, recentPlacements, requiresAction } =
    useCoordinatorDashboard();

  if (isLoading) {
    return <LoadingPage label="Loading dashboard..." />;
  }

  const metrics = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      hint: "Department student records",
      trend: "up" as const,
    },
    {
      label: "Pending Approvals",
      value: stats.pendingPlacements,
      hint: "Placements awaiting review",
      trend: "up" as const,
    },
    {
      label: "Active Placements",
      value: stats.approvedPlacements,
      hint: "Approved placement records",
      trend: "up" as const,
    },
    {
      label: "Need Supervisors",
      value: stats.studentsWithoutSupervisors,
      hint: "Students needing assignment",
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      <DashboardWelcomeBanner
        title="Coordinator Workspace"
        description="Monitor placements, student progress, and supervision coverage for your department."
        action={
          <Button asChild className="h-9">
            <Link href="/coordinator/placements">Review Placements</Link>
          </Button>
        }
      />

      <DashboardMetricsGrid items={metrics} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <DashboardChartCard
            title="Placement Status"
            badge="Distribution"
            controls={
              <span className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">
                Approved/Pending/Rejected
              </span>
            }
          >
            <DashboardDonutChart
              data={chartData.placementStatusData}
              nameKey="name"
              valueKey="value"
            />
          </DashboardChartCard>

          <DashboardChartCard
            title="Students by Level Trend"
            badge="Trend"
            controls={
              <span className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">
                Current records
              </span>
            }
          >
            <DashboardTrendLineChart
              data={chartData.levelData}
              xKey="level"
              yKey="students"
            />
          </DashboardChartCard>

          {recentPlacements.length > 0 ? (
            <SectionCard title="Recent Placements">
              <div className="divide-y">
                {recentPlacements.map((placement: any) => (
                  <div
                    key={placement.id}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium">{placement.companyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeof placement.student === "object"
                          ? placement.student.name
                          : "Student"}
                      </p>
                    </div>
                    <StatusBadge status={placement.status} />
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-4 lg:sticky lg:top-24">
            <InlineQuickActions
              pendingPlacementCount={stats.pendingPlacements}
            />

            {requiresAction ? (
              <section className="rounded-md border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground">Action Required</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {stats.pendingPlacements > 0 ? (
                    <p>
                      <span className="font-semibold text-foreground">
                        {stats.pendingPlacements}
                      </span>{" "}
                      placement(s) pending review.
                    </p>
                  ) : null}
                  {stats.studentsWithoutSupervisors > 0 ? (
                    <p>
                      <span className="font-semibold text-foreground">
                        {stats.studentsWithoutSupervisors}
                      </span>{" "}
                      student(s) need supervisor assignment.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
