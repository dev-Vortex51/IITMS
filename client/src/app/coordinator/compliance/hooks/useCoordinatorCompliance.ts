"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { complianceFormService } from "@/services/compliance-form.service";
import type { ComplianceFormRecord } from "@/app/student/compliance/types";

export function useCoordinatorCompliance() {
  const queryClient = useQueryClient();

  const formsQuery = useQuery({
    queryKey: ["coordinator-compliance-forms"],
    queryFn: async () => {
      const response = await complianceFormService.getComplianceForms({ limit: 300 });
      return (response?.data || []) as ComplianceFormRecord[];
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
    }) => complianceFormService.reviewComplianceForm(id, { status, reviewComment }),
    onSuccess: () => {
      toast.success("Compliance form reviewed");
      queryClient.invalidateQueries({ queryKey: ["coordinator-compliance-forms"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to review compliance form");
    },
  });

  const forms = useMemo(() => formsQuery.data || [], [formsQuery.data]);

  return {
    forms,
    isLoading: formsQuery.isLoading,
    isError: formsQuery.isError,
    reviewMutation,
  };
}
