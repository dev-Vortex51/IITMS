import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import adminService from "@/services/admin.service";
import { toast } from "sonner";

export function useDepartmentsLogic() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );
  const [selectedFaculty, setSelectedFaculty] = useState(
    searchParams.get("faculty") || "all",
  );
  const [showInactive, setShowInactive] = useState(
    searchParams.get("inactive") === "true",
  );
  const itemsPerPage = 12;

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (selectedFaculty && selectedFaculty !== "all")
      params.set("faculty", selectedFaculty);
    if (showInactive) params.set("inactive", "true");

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [
    searchTerm,
    currentPage,
    selectedFaculty,
    showInactive,
    pathname,
    router,
  ]);

  // Queries
  const departmentsQuery = useQuery({
    queryKey: [
      "departments",
      currentPage,
      searchTerm,
      selectedFaculty,
      showInactive,
    ],
    queryFn: () => {
      const params: any = { page: currentPage, limit: itemsPerPage };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedFaculty && selectedFaculty !== "all")
        params.faculty = selectedFaculty;
      if (showInactive) params.isActive = false;
      return adminService.departmentService.getAllDepartments(params);
    },
  });

  const facultiesQuery = useQuery({
    queryKey: ["faculties"],
    queryFn: () => adminService.facultyService.getAllFaculties(),
  });

  // Mutations
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["departments"] });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      adminService.departmentService.createDepartment(data),
    onSuccess: () => {
      invalidate();
      toast.success("Department created successfully");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to create department"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminService.departmentService.deleteDepartment(id),
    onSuccess: () => {
      invalidate();
      toast.success("Department deleted successfully");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to delete department"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) =>
      adminService.departmentService.toggleDepartmentStatus(id),
    onSuccess: (res) => {
      invalidate();
      toast.success(res.message || "Status updated");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to update status"),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminService.departmentService.hardDeleteDepartment(id),
    onSuccess: () => {
      invalidate();
      toast.success("Permanently deleted");
    },
    onError: (err: any) =>
      toast.error(
        err.response?.data?.message || "Failed to permanently delete",
      ),
  });

  const assignCoordinatorMutation = useMutation({
    mutationFn: ({
      departmentId,
      coordinatorId,
    }: {
      departmentId: string;
      coordinatorId: string;
    }) =>
      adminService.departmentService.assignCoordinator(
        departmentId,
        coordinatorId,
      ),
    onSuccess: () => {
      invalidate();
      toast.success("Coordinator assigned successfully");
    },
    onError: (err: any) =>
      toast.error(
        err.response?.data?.message || "Failed to assign coordinator",
      ),
  });

  return {
    state: {
      searchTerm,
      currentPage,
      selectedFaculty,
      showInactive,
      itemsPerPage,
    },
    setters: {
      setSearchTerm,
      setCurrentPage,
      setSelectedFaculty,
      setShowInactive,
    },
    queries: { departmentsQuery, facultiesQuery },
    mutations: {
      createMutation,
      deleteMutation,
      toggleStatusMutation,
      hardDeleteMutation,
      assignCoordinatorMutation,
    },
  };
}
