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

    const approvedStudentIds = new Set<string>();
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    for (const placement of placements) {
      const status = placement?.status;
      if (status === "approved") {
        approvedCount += 1;
        if (placement?.student?.id) {
          approvedStudentIds.add(placement.student.id);
        }
      } else if (status === "pending") {
        pendingCount += 1;
      } else if (status === "rejected") {
        rejectedCount += 1;
      }
    }

    let studentsNeedingSupervisors = 0;
    for (const student of students) {
      const hasApprovedPlacement = approvedStudentIds.has(student.id);
      if (
        hasApprovedPlacement &&
        (!student.departmentalSupervisor || !student.industrialSupervisor)
      ) {
        studentsNeedingSupervisors += 1;
      }
    }

    const placementStatusData = [
      { name: "Approved", value: approvedCount, color: "#10b981" },
      { name: "Pending", value: pendingCount, color: "#f59e0b" },
      { name: "Rejected", value: rejectedCount, color: "#ef4444" },
    ].filter((item) => item.value > 0);

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
        pendingPlacements: pendingCount,
        approvedPlacements: approvedCount,
        studentsWithoutSupervisors: studentsNeedingSupervisors,
      },
      chartData: { placementStatusData, levelData },
      recentPlacements: placements.slice(0, 5),
      requiresAction:
        pendingCount > 0 || studentsNeedingSupervisors > 0,
    };
  }, [
    studentsResponse,
    placementsResponse,
    isLoadingStudents,
    isLoadingPlacements,
  ]);
}
