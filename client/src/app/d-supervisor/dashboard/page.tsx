"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import {
  ErrorLocalState,
  LoadingPage,
} from "@/components/design-system";
import { DashboardOverview } from "./components/DashboardOverview";

export default function DepartmentalSupervisorDashboardPage() {
  useEffect(() => {
    document.title = "Departmental Supervisor Dashboard | ITMS";
  }, []);

  const { user } = useAuth();
  const supervisorId = user?.profileData?.id;

  // Fetch supervisor dashboard data
  const { data: dashboardData, isLoading, isError, refetch } = useQuery({
    queryKey: ["supervisor-dashboard", supervisorId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/supervisors/${supervisorId}/dashboard`,
      );
      return response.data.data;
    },
    enabled: !!supervisorId,
  });
  // Calculate statistics from dashboard data
  const totalStudents = dashboardData?.statistics?.assignedStudents || 0;
  const totalPendingReviews = dashboardData?.statistics?.pendingLogbooks || 0;
  const totalLogbooks = dashboardData?.statistics?.totalLogbooks || 0;

  if (isLoading) {
    return <LoadingPage label="Loading dashboard..." />;
  }

  if (isError) {
    return (
      <div className="space-y-4 md:space-y-5">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <ErrorLocalState
          message="Unable to load dashboard data right now."
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return (
    <DashboardOverview
      dashboardData={dashboardData}
      supervisorId={supervisorId || ""}
      totalStudents={totalStudents}
      totalPendingReviews={totalPendingReviews}
      totalLogbooks={totalLogbooks}
    />
  );
}
