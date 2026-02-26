import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { toast } from "sonner";

export function useFacultyDetails(id: string) {
  const queryClient = useQueryClient();

  const facultyQuery = useQuery({
    queryKey: ["faculty", id],
    queryFn: () => adminService.facultyService.getFacultyById(id),
    enabled: !!id,
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments", "faculty", id],
    queryFn: async () => {
      const response = await adminService.departmentService.getAllDepartments();
      return response.data.filter(
        (dept: any) => dept.facultyId === id || dept.faculty?.id === id,
      );
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      adminService.facultyService.updateFaculty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      toast.success("Faculty updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update faculty");
    },
  });

  return {
    queries: { facultyQuery, departmentsQuery },
    mutations: { updateMutation },
    data: {
      faculty: facultyQuery.data,
      departments: departmentsQuery.data || [],
    },
  };
}
