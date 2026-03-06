import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { placementService, studentService } from "@/services/student.service";

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

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getAllStudents(),
  });

  const placementsQuery = useQuery({
    queryKey: ["placements"],
    queryFn: () => placementService.getAllPlacements({}),
  });

  const faculties = useMemo(() => facultiesQuery.data?.data || [], [facultiesQuery.data]);
  const departments = useMemo(
    () => departmentsQuery.data?.data || [],
    [departmentsQuery.data],
  );
  const students = useMemo(() => studentsQuery.data?.data || [], [studentsQuery.data]);
  const placements = useMemo(
    () => placementsQuery.data?.data || [],
    [placementsQuery.data],
  );

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
      totalStudents: students.length,
      totalPlacements: placements.length,
      approvedPlacements: placements.filter((placement: any) => placement.status === "approved")
        .length,
      pendingPlacements: placements.filter((placement: any) => placement.status === "pending")
        .length,
      rejectedPlacements: placements.filter((placement: any) => placement.status === "rejected")
        .length,
    }),
    [faculties, departments, placements, students],
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
      studentsQuery.isLoading ||
      placementsQuery.isLoading,
  };
}
