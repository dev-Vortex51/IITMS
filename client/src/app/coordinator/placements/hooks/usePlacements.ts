import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { placementService } from "@/services/student.service";

export function usePlacements() {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const departmentId =
    typeof user?.department === "object"
      ? user?.department?.id
      : user?.departmentId || user?.department;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["placements", departmentId, statusFilter],
    queryFn: () => {
      const filters: any = { department: departmentId };
      if (statusFilter !== "all") filters.status = statusFilter;
      return placementService.getAllPlacements(filters);
    },
    enabled: !!departmentId,
  });

  const placements = useMemo(() => data?.data || [], [data]);

  // Memoize filtering to prevent unnecessary recalculations on re-renders
  const filteredPlacements = useMemo(() => {
    return placements.filter((placement: any) => {
      const searchLower = searchQuery.toLowerCase();
      const studentName = placement.student?.name?.toLowerCase() || "";
      const companyName = placement.companyName?.toLowerCase() || "";
      const matricNumber = placement.student?.matricNumber?.toLowerCase() || "";

      return (
        studentName.includes(searchLower) ||
        companyName.includes(searchLower) ||
        matricNumber.includes(searchLower)
      );
    });
  }, [placements, searchQuery]);

  // Pre-calculate all metrics in one pass
  const metrics = useMemo(() => {
    return placements.reduce(
      (acc: any, p: any) => {
        acc.total++;
        if (acc[p.status] !== undefined) acc[p.status]++;
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0, withdrawn: 0 },
    );
  }, [placements]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredPlacements,
    metrics,
    isLoading,
    isError,
  };
}
