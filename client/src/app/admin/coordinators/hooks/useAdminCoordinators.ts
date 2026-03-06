import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "@/hooks/usePagination";
import adminService from "@/services/admin.service";

export function useAdminCoordinators() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => adminService.departmentService.getAllDepartments(),
  });

  const coordinatorsQuery = useQuery({
    queryKey: ["coordinators"],
    queryFn: () => adminService.userService.getAllUsers({ role: "coordinator" }),
  });

  const departments = useMemo(() => departmentsQuery.data?.data || [], [departmentsQuery.data]);
  const coordinators = useMemo(
    () => coordinatorsQuery.data?.data?.users || [],
    [coordinatorsQuery.data],
  );

  const getCoordinatorInfo = (coordinatorId: string) => {
    return coordinators.find((coordinator: any) => coordinator.id === coordinatorId);
  };

  const departmentsWithCoordinators = useMemo(
    () => departments.filter((department: any) => department.coordinators?.length > 0),
    [departments],
  );

  const unassignedDepartments = useMemo(
    () => departments.filter((department: any) => !department.coordinators?.length),
    [departments],
  );

  const totalPages = Math.ceil(departmentsWithCoordinators.length / itemsPerPage);
  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return departmentsWithCoordinators.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, departmentsWithCoordinators]);

  const paginationItems = usePagination({ currentPage, totalPages });

  return {
    currentPage,
    setCurrentPage,
    departments,
    departmentsWithCoordinators,
    unassignedDepartments,
    paginatedDepartments,
    totalPages,
    paginationItems,
    getCoordinatorInfo,
    isLoading: departmentsQuery.isLoading || coordinatorsQuery.isLoading,
  };
}
