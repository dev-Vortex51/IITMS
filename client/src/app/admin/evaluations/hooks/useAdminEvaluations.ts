"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { evaluationService } from "@/services/evaluation.service";
import type { Evaluation } from "@/app/d-supervisor/evaluations/types";

export function useAdminEvaluations() {
  const queryClient = useQueryClient();

  const evaluationsQuery = useQuery({
    queryKey: ["admin-evaluations"],
    queryFn: async () => {
      const response = await evaluationService.getEvaluations({ limit: 300 });
      return response?.data || [];
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => evaluationService.completeEvaluation(id),
    onSuccess: () => {
      toast.success("Evaluation marked as completed");
      queryClient.invalidateQueries({ queryKey: ["admin-evaluations"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to mark evaluation as completed",
      );
    },
  });

  const evaluations = useMemo<Evaluation[]>(
    () => evaluationsQuery.data || [],
    [evaluationsQuery.data],
  );

  return {
    evaluations,
    isLoading: evaluationsQuery.isLoading,
    isError: evaluationsQuery.isError,
    completeMutation,
  };
}
