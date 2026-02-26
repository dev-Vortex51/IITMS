import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { studentService } from "@/services/student.service";

export function useCoordinatorStudents() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

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

  const students = studentsData?.data || [];

  // Memoize filtered students for performance
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const searchLower = searchQuery.toLowerCase();
    return students.filter(
      (student: any) =>
        student.name?.toLowerCase().includes(searchLower) ||
        student.matricNumber?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower),
    );
  }, [students, searchQuery]);

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
    filteredStudents,
    stats,
    isLoading,
  };
}
