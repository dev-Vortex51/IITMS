import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { studentService, placementService } from "@/services/student.service";
import { useMemo } from "react";

export function useCoordinatorDashboard() {
  const { user } = useAuth();

  const departmentId =
    typeof user?.department === "object"
      ? user?.department?.id
      : user?.departmentId || user?.department;

  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", departmentId],
    queryFn: () =>
      studentService.getStudents({ department: departmentId, limit: 100 }),
    enabled: !!departmentId,
  });

  const { data: placementsResponse, isLoading: isLoadingPlacements } = useQuery(
    {
      queryKey: ["placements", departmentId],
      queryFn: () =>
        placementService.getAllPlacements({
          department: departmentId,
          limit: 100,
        }),
      enabled: !!departmentId,
    },
  );

  return useMemo(() => {
    const students = studentsResponse?.data || [];
    const placements = placementsResponse?.data || [];

    const studentsNeedingSupervisors = students.filter((student: any) => {
      const hasApprovedPlacement = placements.some(
        (p: any) => p.student?.id === student.id && p.status === "approved",
      );
      return (
        hasApprovedPlacement &&
        (!student.departmentalSupervisor || !student.industrialSupervisor)
      );
    }).length;

    const pendingPlacements = placements.filter(
      (p: any) => p.status === "pending",
    );

    // Transform data for charts
    const placementStatusData = [
      {
        name: "Approved",
        value: placements.filter((p: any) => p.status === "approved").length,
        color: "#10b981",
      }, // Emerald
      { name: "Pending", value: pendingPlacements.length, color: "#f59e0b" }, // Amber
      {
        name: "Rejected",
        value: placements.filter((p: any) => p.status === "rejected").length,
        color: "#ef4444",
      }, // Rose
    ].filter((item) => item.value > 0); // Only show non-zero segments

    const levelDistribution = students.reduce((acc: any, student: any) => {
      const level = student.level || "Unknown";
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const levelData = Object.entries(levelDistribution).map(
      ([level, count]) => ({
        level,
        students: count,
      }),
    );

    return {
      isLoading: isLoadingStudents || isLoadingPlacements,
      stats: {
        totalStudents: students.length,
        pendingPlacements: pendingPlacements.length,
        approvedPlacements: placements.filter(
          (p: any) => p.status === "approved",
        ).length,
        studentsWithoutSupervisors: studentsNeedingSupervisors,
      },
      chartData: { placementStatusData, levelData },
      recentPlacements: placements.slice(0, 5),
      requiresAction:
        pendingPlacements.length > 0 || studentsNeedingSupervisors > 0,
    };
  }, [
    studentsResponse,
    placementsResponse,
    isLoadingStudents,
    isLoadingPlacements,
  ]);
}
