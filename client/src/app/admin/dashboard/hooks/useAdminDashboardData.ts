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

  const faculties = facultiesData?.data || [];
  const departments = departmentsData?.data || [];
  const students = studentsData?.data || [];
  const placements = placementsData?.data || [];

  // Computed Stats
  const stats = {
    totalFaculties: faculties.length,
    totalDepartments: departments.length,
    totalStudents: students.length,
    activePlacements: placements.filter((p: any) => p.status === "approved")
      .length,
  };

  // Chart Data Preparation
  const departmentChartData = departments.slice(0, 6).map((dept: any) => ({
    name:
      dept.name.length > 15 ? dept.name.substring(0, 15) + "..." : dept.name,
    students: dept.studentCount || 0,
  }));

  const placementChartData = [
    {
      name: "Approved",
      value: placements.filter((p: any) => p.status === "approved").length,
      color: "#22c55e",
    },
    {
      name: "Pending",
      value: placements.filter((p: any) => p.status === "pending").length,
      color: "#eab308",
    },
    {
      name: "Rejected",
      value: placements.filter((p: any) => p.status === "rejected").length,
      color: "#ef4444",
    },
  ];

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
