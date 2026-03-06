import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import type { AssessmentScore } from "../types";

export function getStatusBadge(status: string) {
  const variants = {
    pending: {
      variant: "secondary" as const,
      icon: Clock,
      label: "Pending",
      className: undefined,
    },
    submitted: {
      variant: "default" as const,
      icon: FileText,
      label: "Submitted",
      className: undefined,
    },
    approved: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Approved",
      className: "bg-green-500 hover:bg-green-600",
    },
    rejected: {
      variant: "destructive" as const,
      icon: XCircle,
      label: "Rejected",
      className: undefined,
    },
  };
  const config = variants[status as keyof typeof variants] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className || ""}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

export function getRecommendationBadge(recommendation: string) {
  const variants = {
    excellent: "bg-green-600 hover:bg-green-700",
    very_good: "bg-green-500 hover:bg-green-600",
    good: "bg-blue-500 hover:bg-blue-600",
    fair: "bg-yellow-500 hover:bg-yellow-600",
    poor: "bg-red-500 hover:bg-red-600",
  };
  return (
    <Badge
      className={
        variants[recommendation as keyof typeof variants] || variants.good
      }
    >
      {recommendation.replace("_", " ").toUpperCase()}
    </Badge>
  );
}

export function calculateAverageScore(scores: AssessmentScore) {
  const scoreValues = Object.values(scores).filter((s) => s > 0);
  const avg =
    scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
  return avg.toFixed(1);
}
