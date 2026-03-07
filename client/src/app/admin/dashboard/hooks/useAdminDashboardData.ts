import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { studentService, placementService } from "@/services/student.service";

export function useAdminDashboardData() {
  const {
    data: facultiesData,
    isLoading: isLoadingFaculties,
    error: facultiesError,
  } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => adminService.facultyService.getAllFaculties(),
  });

  const {
    data: departmentsData,
    isLoading: isLoadingDepts,
    error: departmentsError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: () => adminService.departmentService.getAllDepartments(),
  });

  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getStudents(),
  });

  const {
    data: placementsData,
    isLoading: isLoadingPlacements,
    error: placementsError,
  } = useQuery({
    queryKey: ["placements"],
    queryFn: () => placementService.getAllPlacements({}),
  });

  const faculties = useMemo(() => facultiesData?.data || [], [facultiesData]);
  const departments = useMemo(
    () => departmentsData?.data || [],
    [departmentsData],
  );
  const students = useMemo(() => studentsData?.data || [], [studentsData]);
  const placements = useMemo(
    () => placementsData?.data || [],
    [placementsData],
  );

  const { stats, departmentChartData, placementChartData } = useMemo(() => {
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    for (const placement of placements) {
      const status = placement?.status;
      if (status === "approved") approvedCount += 1;
      else if (status === "pending") pendingCount += 1;
      else if (status === "rejected") rejectedCount += 1;
    }

    const departmentChart = departments.slice(0, 6).map((dept: any) => ({
      name:
        dept.name.length > 15 ? `${dept.name.substring(0, 15)}...` : dept.name,
      students: dept.studentCount || 0,
    }));

    return {
      stats: {
        totalFaculties: faculties.length,
        totalDepartments: departments.length,
        totalStudents: students.length,
        activePlacements: approvedCount,
      },
      departmentChartData: departmentChart,
      placementChartData: [
        { name: "Approved", value: approvedCount, color: "#22c55e" },
        { name: "Pending", value: pendingCount, color: "#eab308" },
        { name: "Rejected", value: rejectedCount, color: "#ef4444" },
      ],
    };
  }, [departments, faculties.length, placements, students.length]);

  const isLoading =
    isLoadingFaculties ||
    isLoadingDepts ||
    isLoadingStudents ||
    isLoadingPlacements;
  const error =
    facultiesError || departmentsError || studentsError || placementsError;

  return {
    faculties,
    departments,
    stats,
    chartData: {
      departments: departmentChartData,
      placements: placementChartData,
    },
    isLoading,
    error,
  };
}
