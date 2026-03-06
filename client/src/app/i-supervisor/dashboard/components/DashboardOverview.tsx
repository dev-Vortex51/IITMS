import Link from "next/link";
import {
  DashboardChartCard,
  DashboardDonutChart,
  DashboardMetricsGrid,
  DashboardTrendLineChart,
  DashboardWelcomeBanner,
  EmptyState,
  SectionCard,
  StatusBadge,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { InlineQuickActions } from "./InlineQuickActions";

interface DashboardOverviewProps {
  dashboardData: any;
  supervisorId: string;
  totalStudents: number;
  totalPendingReviews: number;
  totalLogbooks: number;
}

export function DashboardOverview({
  dashboardData,
  supervisorId,
  totalStudents,
  totalPendingReviews,
  totalLogbooks,
}: DashboardOverviewProps) {
  const students = dashboardData?.supervisor?.assignedStudents || [];

  const metrics = [
    {
      label: "Assigned Students",
      value: totalStudents,
      hint: "Students currently under workplace supervision",
      trend: "up" as const,
    },
    {
      label: "Pending Reviews",
      value: totalPendingReviews,
      hint: "Submitted logbooks waiting for review",
      trend: totalPendingReviews > 0 ? ("down" as const) : ("up" as const),
    },
    {
      label: "Total Logbooks",
      value: totalLogbooks,
      hint: "All logbook entries from assigned students",
      trend: "up" as const,
    },
    {
      label: "Review Completion",
      value:
        totalLogbooks > 0
          ? `${Math.round(((totalLogbooks - totalPendingReviews) / totalLogbooks) * 100)}%`
          : "0%",
      hint: "Reviewed vs total logbooks",
      trend: "neutral" as const,
    },
  ];

  const placementStatusData = [
    {
      name: "Approved",
      value: students.filter((student: any) => student.currentPlacement?.status === "approved")
        .length,
      color: "hsl(var(--primary))",
    },
    {
      name: "Pending",
      value: students.filter((student: any) => student.currentPlacement?.status === "pending")
        .length,
      color: "hsl(var(--muted-foreground))",
    },
    {
      name: "No Placement",
      value: students.filter((student: any) => !student.currentPlacement).length,
      color: "hsl(var(--accent-foreground))",
    },
  ].filter((item) => item.value > 0);

  const departmentCountMap = students.reduce((acc: Record<string, number>, student: any) => {
    const departmentLabel =
      typeof student.department === "object" && student.department?.name
        ? student.department.name
        : "Unknown";
    acc[departmentLabel] = (acc[departmentLabel] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.entries(departmentCountMap).map(([department, count]) => ({
    department,
    students: count,
  }));

  return (
    <div className="space-y-4 md:space-y-5">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      <DashboardWelcomeBanner
        title="Industrial Supervisor Workspace"
        description="Monitor assigned students, review logbooks, and track placement activity in one workspace."
        action={
          <Button asChild className="h-9">
            <Link href="/i-supervisor/logbooks">Open Logbooks</Link>
          </Button>
        }
      />

      <DashboardMetricsGrid items={metrics} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <DashboardChartCard
            title="Placement Coverage"
            badge="Distribution"
            controls={
              <span className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">
                Approved/Pending/No Placement
              </span>
            }
          >
            {placementStatusData.length > 0 ? (
              <DashboardDonutChart
                data={placementStatusData}
                nameKey="name"
                valueKey="value"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  title="No placement data"
                  description="Placement status will appear when students are assigned."
                />
              </div>
            )}
          </DashboardChartCard>

          <DashboardChartCard
            title="Students by Department Trend"
            badge="Trend"
            controls={
              <span className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">
                Current assignments
              </span>
            }
          >
            {departmentData.length > 0 ? (
              <DashboardTrendLineChart
                data={departmentData}
                xKey="department"
                yKey="students"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  title="No department data"
                  description="Assigned students will be displayed here."
                />
              </div>
            )}
          </DashboardChartCard>

          <SectionCard title="My Students">
            {students.length > 0 ? (
              <div className="space-y-3">
                {students.slice(0, 5).map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {student.user?.firstName} {student.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{student.matricNumber || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={student.currentPlacement?.status || "No Placement"} />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {student.currentPlacement?.companyName || "No company assigned"}
                      </p>
                    </div>
                  </div>
                ))}
                {students.length > 5 ? (
                  <Button asChild variant="outline" className="h-9">
                    <Link href="/i-supervisor/students">View All Students</Link>
                  </Button>
                ) : null}
              </div>
            ) : (
              <EmptyState
                title="No Students Assigned"
                description="Students will appear here once assigned to you."
              />
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-4 lg:sticky lg:top-24">
            <InlineQuickActions
              supervisorId={supervisorId}
              pendingLogbookCount={totalPendingReviews}
            />

            <SectionCard title="Action Required">
              {totalPendingReviews > 0 ? (
                <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{totalPendingReviews}</span> logbook
                    {totalPendingReviews > 1 ? "s" : ""} awaiting your review.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/i-supervisor/logbooks">Review Now</Link>
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title="No pending reviews"
                  description="All submitted logbooks are currently up to date."
                />
              )}
            </SectionCard>
          </div>
        </div>
      </section>
    </div>
  );
}
