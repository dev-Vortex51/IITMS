"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { evaluationService } from "@/services/evaluation.service";
import type { Evaluation, EvaluationScore, StudentOption } from "../types";

const defaultScores: EvaluationScore = {
  technicalSkill: 0,
  communication: 0,
  professionalism: 0,
  punctuality: 0,
  problemSolving: 0,
  workAttitude: 0,
  initiative: 0,
};

export function useDepartmentalEvaluations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supervisorId = user?.profileData?.id;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(
    null,
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [evaluationType, setEvaluationType] = useState<"midterm" | "final">(
    "midterm",
  );
  const [scores, setScores] = useState<EvaluationScore>(defaultScores);
  const [strengths, setStrengths] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");
  const [comment, setComment] = useState("");

  const dashboardQuery = useQuery({
    queryKey: ["supervisor-dashboard", supervisorId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/supervisors/${supervisorId}/dashboard`,
      );
      return response.data.data;
    },
    enabled: !!supervisorId,
  });

  const evaluationsQuery = useQuery({
    queryKey: ["evaluations", supervisorId],
    queryFn: async () => {
      const response = await evaluationService.getEvaluations({
        supervisor: supervisorId,
        limit: 100,
      });
      return response?.data || [];
    },
    enabled: !!supervisorId,
  });

  const resetForm = () => {
    setSelectedStudent("");
    setEvaluationType("midterm");
    setScores(defaultScores);
    setStrengths("");
    setAreasForImprovement("");
    setComment("");
  };

  const createEvaluationMutation = useMutation({
    mutationFn: async (payload: any) => evaluationService.createEvaluation(payload),
    onSuccess: () => {
      toast.success("Evaluation created successfully");
      queryClient.invalidateQueries({ queryKey: ["evaluations", supervisorId] });
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create evaluation");
    },
  });

  const updateEvaluationMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      evaluationService.updateEvaluation(id, payload),
    onSuccess: () => {
      toast.success("Evaluation updated successfully");
      queryClient.invalidateQueries({ queryKey: ["evaluations", supervisorId] });
      resetForm();
      setEditingEvaluationId(null);
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update evaluation");
    },
  });

  const submitEvaluationMutation = useMutation({
    mutationFn: async (id: string) => evaluationService.submitEvaluation(id),
    onSuccess: () => {
      toast.success("Evaluation submitted");
      queryClient.invalidateQueries({ queryKey: ["evaluations", supervisorId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit evaluation");
    },
  });

  const completeEvaluationMutation = useMutation({
    mutationFn: async (id: string) => evaluationService.completeEvaluation(id),
    onSuccess: () => {
      toast.success("Evaluation marked as completed");
      queryClient.invalidateQueries({ queryKey: ["evaluations", supervisorId] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to complete evaluation",
      );
    },
  });

  const getPayload = () => ({
    student: selectedStudent,
    type: evaluationType,
    scores,
    strengths,
    areasForImprovement,
    comment,
  });

  const handleSubmitEvaluation = () => {
    const payload = getPayload();
    if (editingEvaluationId) {
      updateEvaluationMutation.mutate({ id: editingEvaluationId, payload });
      return;
    }
    createEvaluationMutation.mutate(payload);
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingEvaluationId(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (evaluation: Evaluation) => {
    setEditingEvaluationId(evaluation.id);
    setSelectedStudent(evaluation.student.id);
    setEvaluationType(evaluation.type);
    setScores({
      technicalSkill: evaluation.technicalSkill,
      communication: evaluation.communication,
      professionalism: evaluation.professionalism,
      punctuality: evaluation.punctuality,
      problemSolving: evaluation.problemSolving,
      workAttitude: evaluation.workAttitude || 0,
      initiative: evaluation.initiative || 0,
    });
    setStrengths(evaluation.strengths || "");
    setAreasForImprovement(evaluation.areasForImprovement || "");
    setComment(evaluation.comment || "");
    setIsCreateDialogOpen(true);
  };

  const handleCreateEvaluation = () => {
    handleSubmitEvaluation();
  };

  const handleCloseDialog = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      resetForm();
      setEditingEvaluationId(null);
    }
  };

  const evaluations = useMemo<Evaluation[]>(
    () => evaluationsQuery.data || [],
    [evaluationsQuery.data],
  );

  const students = useMemo<StudentOption[]>(
    () => dashboardQuery.data?.supervisor?.assignedStudents || [],
    [dashboardQuery.data],
  );

  return {
    evaluations,
    students,
    isLoading: evaluationsQuery.isLoading || dashboardQuery.isLoading,
    isCreateDialogOpen,
    editingEvaluationId,
    openCreateDialog,
    openEditDialog,
    handleCloseDialog,
    selectedEvaluation,
    setSelectedEvaluation,
    isViewDialogOpen,
    setIsViewDialogOpen,
    selectedStudent,
    setSelectedStudent,
    evaluationType,
    setEvaluationType,
    scores,
    setScores,
    strengths,
    setStrengths,
    areasForImprovement,
    setAreasForImprovement,
    comment,
    setComment,
    handleCreateEvaluation,
    handleSubmitEvaluation,
    createEvaluationMutation,
    updateEvaluationMutation,
    submitEvaluationMutation,
    completeEvaluationMutation,
  };
}
