import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { toast } from "sonner";

export function useDepartmentDetails(id: string) {
  const queryClient = useQueryClient();

  const departmentQuery = useQuery({
    queryKey: ["department", id],
    queryFn: () => adminService.departmentService.getDepartmentById(id),
    enabled: !!id,
  });

  const facultiesQuery = useQuery({
    queryKey: ["faculties"],
    queryFn: () => adminService.facultyService.getAllFaculties(),
  });

  const department = departmentQuery.data;

  const coordinatorQueries = useQuery({
    queryKey: ["department-coordinators", department?.id],
    queryFn: async () => {
      if (!department?.coordinators?.length) {
        return [];
      }

      const coordinators = Array.isArray(department.coordinators)
        ? department.coordinators
        : [];

      // If coordinators are already full user objects, return them directly
      if (
        coordinators.length > 0 &&
        typeof coordinators[0] === "object" &&
        coordinators[0]?.email
      ) {
        return coordinators;
      }

      // Otherwise, they're string IDs - fetch full user data
      const coordinatorIds: string[] = coordinators
        .map((coord: any) => (typeof coord === "string" ? coord : coord?.id))
        .filter((id: any): id is string => !!id);

      if (!coordinatorIds.length) return [];

      const results = await Promise.allSettled(
        coordinatorIds.map((coordId: string) =>
          adminService.userService.getUserById(coordId),
        ),
      );

      const fetchedCoordinators = results
        .filter(
          (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled",
        )
        .map((r) => r.value.data);

      console.log("Fetched coordinators:", fetchedCoordinators);
      return fetchedCoordinators;
    },
    enabled: !!department?.id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      adminService.departmentService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department", id] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update department");
    },
  });

  return {
    queries: { departmentQuery, facultiesQuery, coordinatorQueries },
    mutations: { updateMutation },
    data: {
      department,
      faculties: facultiesQuery.data?.data || [],
      coordinatorsList: coordinatorQueries.data || [],
    },
  };
}
