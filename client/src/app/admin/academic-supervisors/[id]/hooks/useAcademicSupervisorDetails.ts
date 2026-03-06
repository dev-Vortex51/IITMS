import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";

export function useAcademicSupervisorDetails(id: string) {
  const supervisorQuery = useQuery({
    queryKey: ["academic-supervisor", id],
    queryFn: () => adminService.supervisorService.getSupervisorById(id),
    enabled: !!id,
  });

  return {
    supervisor: supervisorQuery.data || null,
    isLoading: supervisorQuery.isLoading,
    isError: supervisorQuery.isError,
    error: supervisorQuery.error as Error | null,
    refetch: supervisorQuery.refetch,
  };
}
