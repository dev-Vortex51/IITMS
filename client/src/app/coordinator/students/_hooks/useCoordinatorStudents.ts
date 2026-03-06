import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { studentService } from "@/services/student.service";

export function useCoordinatorStudents() {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [placementFilter, setPlacementFilter] = useState("all");

  // Safely extract department ID
  const departmentId =
    typeof user?.department === "object"
      ? user?.department?.id
      : user?.departmentId || user?.department;

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["students", departmentId],
    queryFn: () =>
      studentService.getStudents({ department: departmentId, limit: 200 }),
    enabled: !!departmentId,
  });

  const students = useMemo(() => studentsData?.data || [], [studentsData]);

  // Memoize filtered students for performance
  const filteredStudents = useMemo(() => {
    const statusMatches = (student: any) => {
      const placementStatus = student.placement?.status;
      if (placementFilter === "all") return true;
      if (placementFilter === "no-placement") return !student.placement;
      return placementStatus === placementFilter;
    };

    const searchLower = searchQuery.toLowerCase();

    return students.filter(
      (student: any) =>
        statusMatches(student) &&
        (!searchLower ||
          student.name?.toLowerCase().includes(searchLower) ||
          student.matricNumber?.toLowerCase().includes(searchLower) ||
          student.email?.toLowerCase().includes(searchLower)),
    );
  }, [students, searchQuery, placementFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: students.length,
      withPlacement: students.filter((s: any) => s.placement).length,
      withSupervisors: students.filter(
        (s: any) =>
          s.placement?.departmentalSupervisor ||
          s.placement?.industrialSupervisor,
      ).length,
      noPlacement: students.filter((s: any) => !s.placement).length,
    };
  }, [students]);

  return {
    searchQuery,
    setSearchQuery,
    placementFilter,
    setPlacementFilter,
    filteredStudents,
    stats,
    isLoading,
  };
}
