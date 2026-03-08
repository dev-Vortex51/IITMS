import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { apiClient } from "@/lib/api-client";

export function useAdminReports() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const facultiesQuery = useQuery({
    queryKey: ["faculties"],
    queryFn: () => adminService.facultyService.getAllFaculties(),
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => adminService.departmentService.getAllDepartments(),
  });

  const overviewQuery = useQuery({
    queryKey: ["reports", "institutional-overview"],
    queryFn: async () => {
      const response = await apiClient.get("/reports/institutional-overview");
      return response.data?.data || null;
    },
  });

  const faculties = useMemo(() => facultiesQuery.data?.data || [], [facultiesQuery.data]);
  const departments = useMemo(
    () => departmentsQuery.data?.data || [],
    [departmentsQuery.data],
  );
  const overview = useMemo(() => overviewQuery.data?.overview || null, [overviewQuery.data]);

  const filteredDepartments = useMemo(() => {
    if (selectedFaculty === "all") return departments;

    return departments.filter(
      (department: any) =>
        (typeof department.faculty === "object"
          ? department.faculty.id
          : department.faculty) === selectedFaculty,
    );
  }, [departments, selectedFaculty]);

  const filteredFaculties = useMemo(() => {
    let filtered = faculties;

    if (selectedFaculty !== "all") {
      filtered = filtered.filter((faculty: any) => faculty.id === selectedFaculty);
    }

    if (selectedDepartment !== "all") {
      const department = departments.find((dept: any) => dept.id === selectedDepartment);
      const deptFacultyId =
        typeof department?.faculty === "object"
          ? department?.faculty?.id
          : department?.faculty;

      if (deptFacultyId) {
        filtered = filtered.filter((faculty: any) => faculty.id === deptFacultyId);
      }
    }

    return filtered;
  }, [departments, faculties, selectedDepartment, selectedFaculty]);

  const stats = useMemo(
    () => ({
      totalFaculties: faculties.length,
      totalDepartments: departments.length,
      totalStudents: overview?.totalStudents || 0,
      totalPlacements:
        (overview?.approvedPlacements || 0) + (overview?.pendingPlacements || 0),
      approvedPlacements: overview?.approvedPlacements || 0,
      pendingPlacements: overview?.pendingPlacements || 0,
      rejectedPlacements: overview?.rejectedPlacements || 0,
    }),
    [departments, faculties, overview],
  );

  return {
    selectedFaculty,
    setSelectedFaculty,
    selectedDepartment,
    setSelectedDepartment,
    faculties,
    departments,
    filteredDepartments,
    filteredFaculties,
    stats,
    isLoading:
      facultiesQuery.isLoading ||
      departmentsQuery.isLoading ||
      overviewQuery.isLoading,
  };
}
