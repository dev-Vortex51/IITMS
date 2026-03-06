import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";

export function useAcademicSupervisors() {
  const supervisorsQuery = useQuery({
    queryKey: ["supervisors", "academic"],
    queryFn: async () => adminService.supervisorService.getAllSupervisors(),
  });

  const allSupervisors = useMemo(
    () => supervisorsQuery.data?.data || [],
    [supervisorsQuery.data],
  );

  const academicSupervisors = useMemo(
    () =>
      allSupervisors.filter(
        (supervisor: any) =>
          supervisor.type === "academic" || supervisor.type === "departmental",
      ),
    [allSupervisors],
  );

  const availableCount = useMemo(
    () =>
      academicSupervisors.filter(
        (supervisor: any) =>
          (supervisor.assignedStudents?.length || 0) < (supervisor.maxStudents || 10),
      ).length,
    [academicSupervisors],
  );

  const totalStudentsSupervised = useMemo(
    () =>
      academicSupervisors.reduce(
        (sum: number, supervisor: any) => sum + (supervisor.assignedStudents?.length || 0),
        0,
      ),
    [academicSupervisors],
  );

  return {
    academicSupervisors,
    availableCount,
    totalStudentsSupervised,
    isLoading: supervisorsQuery.isLoading,
  };
}
