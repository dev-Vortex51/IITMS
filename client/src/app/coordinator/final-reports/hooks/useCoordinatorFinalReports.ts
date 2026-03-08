"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { technicalReportService } from "@/services/technical-report.service";
import type { TechnicalReportRecord } from "@/app/student/final-report/types";

export function useCoordinatorFinalReports() {
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ["coordinator-final-reports"],
    queryFn: async () => {
      const response = await technicalReportService.getTechnicalReports({ limit: 300 });
      return (response?.data || []) as TechnicalReportRecord[];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      reviewComment,
    }: {
      id: string;
      status: "approved" | "rejected";
      reviewComment?: string;
    }) => technicalReportService.reviewTechnicalReport(id, { status, reviewComment }),
    onSuccess: () => {
      toast.success("Final technical report reviewed");
      queryClient.invalidateQueries({ queryKey: ["coordinator-final-reports"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to review report");
    },
  });

  const reports = useMemo(() => reportsQuery.data || [], [reportsQuery.data]);

  return {
    reports,
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    reviewMutation,
  };
}
