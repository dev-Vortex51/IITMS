"use client";

import { useEffect } from "react";
import { useAdminDashboardData } from "./hooks/useAdminDashboardData";
import { StatsGrid } from "./components/StatsGrid";
import { QuickActions } from "./components/QuickActions";
import { DashboardCharts } from "./components/DashboardCharts";
import { RecentActivity } from "./components/RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  useEffect(() => {
    document.title = "Admin Dashboard | ITMS";
  }, []);

  const { faculties, departments, stats, chartData, isLoading } =
    useAdminDashboardData();

  if (isLoading) {
    // Optional: Return a simple loading state or Skeleton UI here
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          System overview and management
        </p>
      </div>

      <StatsGrid stats={stats} />

      <QuickActions />

      <DashboardCharts
        departmentsData={chartData.departments}
        placementsData={chartData.placements}
      />

      <RecentActivity faculties={faculties} departments={departments} />
    </div>
  );
}
