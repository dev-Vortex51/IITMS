import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { Assessment, AssessmentScore, Student } from "../types";

const defaultScores: AssessmentScore = {
  technical: 0,
  communication: 0,
  punctuality: 0,
  initiative: 0,
  teamwork: 0,
  professionalism: 0,
  problemSolving: 0,
  adaptability: 0,
};

export function useSupervisorAssessments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supervisorId = user?.profileData?.id;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [assessmentType, setAssessmentType] = useState<"midterm" | "final">(
    "midterm",
  );
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [scores, setScores] = useState<AssessmentScore>(defaultScores);
  const [strengths, setStrengths] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");
  const [comment, setComment] = useState("");
  const [recommendation, setRecommendation] = useState<
    "excellent" | "very_good" | "good" | "fair" | "poor"
  >("good");

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

  const assessmentsQuery = useQuery({
    queryKey: ["assessments", supervisorId],
    queryFn: async () => {
      const response = await apiClient.get("/assessments", {
        params: { supervisor: supervisorId },
      });
      return response.data.data;
    },
    enabled: !!supervisorId,
  });

  const resetForm = () => {
    setSelectedStudent("");
    setAssessmentType("midterm");
    setScores(defaultScores);
    setStrengths("");
    setAreasForImprovement("");
    setComment("");
    setRecommendation("good");
  };

  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      const response = await apiClient.post("/assessments", assessmentData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Assessment created successfully");
      queryClient.invalidateQueries({ queryKey: ["assessments", supervisorId] });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-dashboard", supervisorId],
      });
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create assessment",
      );
    },
  });

  const handleCreateAssessment = () => {
    const scoreValues = Object.values(scores).filter((s) => s > 0);
    const avgScore =
      scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;

    let grade = "F";
    if (avgScore >= 70) grade = "A";
    else if (avgScore >= 60) grade = "B";
    else if (avgScore >= 50) grade = "C";
    else if (avgScore >= 45) grade = "D";
    else if (avgScore >= 40) grade = "E";

    const assessmentData = {
      student: selectedStudent,
      type: assessmentType,
      scores,
      strengths,
      areasForImprovement,
      comment,
      recommendation,
      grade,
    };

    createAssessmentMutation.mutate(assessmentData);
  };

  const assessments: Assessment[] = assessmentsQuery.data || [];
  const students: Student[] =
    dashboardQuery.data?.supervisor?.assignedStudents || [];

  const pendingAssessments = useMemo(
    () => assessments.filter((a) => a.status === "pending"),
    [assessments],
  );
  const completedAssessments = useMemo(
    () => assessments.filter((a) => a.status !== "pending"),
    [assessments],
  );

  return {
    supervisorId,
    assessments,
    students,
    pendingAssessments,
    completedAssessments,
    isLoading: assessmentsQuery.isLoading,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    selectedStudent,
    setSelectedStudent,
    assessmentType,
    setAssessmentType,
    selectedAssessment,
    setSelectedAssessment,
    isViewDialogOpen,
    setIsViewDialogOpen,
    scores,
    setScores,
    strengths,
    setStrengths,
    areasForImprovement,
    setAreasForImprovement,
    comment,
    setComment,
    recommendation,
    setRecommendation,
    handleCreateAssessment,
    createAssessmentMutation,
    resetForm,
  };
}
