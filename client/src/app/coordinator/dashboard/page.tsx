"use client";

import { useEffect } from "react";
import { useCoordinatorDashboard } from "./hooks/useCoordinatorDashboard";
import { DashboardCharts } from "./components/DashboardCharts";
import { ActionSidebar } from "./components/ActionSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle, UserCheck } from "lucide-react";

export default function CoordinatorDashboardPage() {
  useEffect(() => {
    document.title = "Coordinator Dashboard | ITMS";
  }, []);

  const { isLoading, stats, chartData, recentPlacements, requiresAction } =
    useCoordinatorDashboard();

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  // Define stats array for clean mapping
  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingPlacements,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Active Placements",
      value: stats.approvedPlacements,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      label: "Missing Supervisors",
      value: stats.studentsWithoutSupervisors,
      icon: UserCheck,
      color: "text-rose-600",
    },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of SIWES operations and student statuses.
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="shadow-sm border-border/50">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 bg-muted/50 rounded-full ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid: 2/3 Left, 1/3 Right */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Analytics & Data */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardCharts chartData={chartData} />

          {/* Recent Placements List */}
          {recentPlacements.length > 0 && (
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Recent Placements
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y">
                  {recentPlacements.map((placement: any) => (
                    <div
                      key={placement.id}
                      className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {placement.companyName}
                        </p>
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Actions & Alerts */}
        <div className="lg:col-span-1">
          <ActionSidebar stats={stats} requiresAction={requiresAction} />
        </div>
      </div>
    </div>
  );
}

// Small helper for consistent styling
function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
    default: "bg-gray-100 text-gray-800",
  };
  const badgeStyle = styles[status] || styles.default;

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${badgeStyle}`}
    >
      {status}
    </span>
  );
}
