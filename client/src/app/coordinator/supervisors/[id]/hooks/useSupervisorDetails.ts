import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";

export function useSupervisorDetails(id: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["supervisor", id],
    queryFn: () => adminService.supervisorService.getSupervisorById(id),
    enabled: !!id,
  });

  // Depending on your API, data might be nested (e.g., data.data)
  const supervisor = data?.data || data;

  const assignedStudents = supervisor?.students || [];
  const isDepartmental =
    supervisor?.type === "departmental" || !!supervisor?.department;

  // Mocking metrics that aren't provided by the API yet
  const metrics = {
    students: assignedStudents.length,
    pendingReviews: 0,
    completedAssessments: 0,
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
