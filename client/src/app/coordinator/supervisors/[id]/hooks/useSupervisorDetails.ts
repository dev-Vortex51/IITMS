import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";

export function useSupervisorDetails(id: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["supervisor", id],
    queryFn: () => adminService.supervisorService.getSupervisorById(id),
    enabled: !!id,
  });

  const supervisor = data;

  const assignedStudents = supervisor?.students || [];
  const isDepartmental =
    supervisor?.type === "departmental" || !!supervisor?.department;

  // Mocking metrics that aren't provided by the API yet
  const metrics = {
    students: assignedStudents.length,
    capacity: supervisor?.maxStudents || 0,
    isActive: supervisor?.isActive !== false,
  };

  return {
    supervisor,
    assignedStudents,
    isDepartmental,
    metrics,
    isLoading,
    isError,
  };
}
