import type {
  Assessment,
  AssessmentScoreBadge,
  AssessmentStatusBadge,
} from "../types";

export function getStatusBadge(status: string): AssessmentStatusBadge {
  const configs: Record<string, AssessmentStatusBadge> = {
    completed: { variant: "default", text: "Completed" },
    draft: { variant: "secondary", text: "Draft" },
    submitted: { variant: "default", text: "Submitted" },
  };

  return configs[status] || configs.draft;
}

export function getScoreBadge(score: number): AssessmentScoreBadge {
  if (score >= 80) return { variant: "default", label: "Excellent" };
  if (score >= 70) return { variant: "default", label: "Very Good" };
  if (score >= 60) return { variant: "outline", label: "Good" };
  if (score >= 50) return { variant: "outline", label: "Fair" };
  return { variant: "destructive", label: "Poor" };
}

export function filterAssessments(assessments: Assessment[], searchQuery: string) {
  const query = searchQuery.toLowerCase();
  if (!query) return assessments;

  return assessments.filter((assessment) => {
    const studentName = assessment.student?.name?.toLowerCase() || "";
    const matricNumber = assessment.student?.matricNumber?.toLowerCase() || "";
    return studentName.includes(query) || matricNumber.includes(query);
  });
}
