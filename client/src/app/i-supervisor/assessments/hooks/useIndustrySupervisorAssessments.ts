import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import type { Assessment } from "../types";
import { filterAssessments } from "../utils/assessment-ui";

export function useIndustrySupervisorAssessments() {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const assessmentsQuery = useQuery({
    queryKey: ["assessments", user?.id, statusFilter],
    queryFn: async () => {
      return { data: [] as Assessment[] };
    },
    enabled: !!user?.id,
  });

  const assessments = useMemo(
    () => assessmentsQuery.data?.data || [],
    [assessmentsQuery.data],
  );

  const filteredAssessments = useMemo(
    () => filterAssessments(assessments, searchQuery),
    [assessments, searchQuery],
  );

  const completedCount = useMemo(
    () =>
      assessments.filter(
        (assessment) =>
          assessment.status === "completed" || assessment.status === "submitted",
      ).length,
    [assessments],
  );

  const draftCount = useMemo(
    () => assessments.filter((assessment) => assessment.status === "draft").length,
    [assessments],
  );

  const averageScore = useMemo(() => {
    if (!assessments.length) return 0;

    return Math.round(
      assessments.reduce((sum, assessment) => sum + (assessment.totalScore || 0), 0) /
        assessments.length,
    );
  }, [assessments]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    assessments,
    filteredAssessments,
    completedCount,
    draftCount,
    averageScore,
    isLoading: assessmentsQuery.isLoading,
  };
}
