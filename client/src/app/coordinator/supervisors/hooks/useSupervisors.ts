import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { toast } from "sonner";

export function useSupervisors(user: any) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["supervisors"],
    queryFn: async () => {
      const result = await adminService.supervisorService.getAllSupervisors();
      return result?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      adminService.supervisorService.createSupervisor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      toast.success("Industrial supervisor created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create supervisor",
      );
    },
  });

  const allSupervisors = data || [];

  const academicSupervisors = allSupervisors.filter(
    (s: any) => s.type === "academic" || s.type === "departmental",
  );

  const industrialSupervisors = allSupervisors.filter(
    (s: any) => s.type === "industrial" || s.companyName,
  );

  const activeCount = allSupervisors.filter(
    (s: any) => s.status === "active",
  ).length;

  const createSupervisor = async (formData: any) => {
    if (!user?.department) {
      toast.error("Department information is missing");
      return;
    }

    const departmentId =
      typeof user.department === "object"
        ? user.department.id
        : user.department;

    await createMutation.mutateAsync({
      ...formData,
      role: "industrial_supervisor",
      department: departmentId,
    });
  };

  return {
    allSupervisors,
    academicSupervisors,
    industrialSupervisors,
    stats: {
      total: allSupervisors.length,
      academic: academicSupervisors.length,
      industrial: industrialSupervisors.length,
      active: activeCount,
    },
    isLoading,
    createSupervisor,
    isCreating: createMutation.isPending,
  };
}
