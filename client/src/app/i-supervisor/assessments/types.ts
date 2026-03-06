export interface AssessmentStudent {
  name?: string;
  matricNumber?: string;
}

export interface Assessment {
  id: string;
  student?: AssessmentStudent;
  status: "draft" | "completed" | "submitted" | string;
  totalScore?: number;
  createdAt?: string;
}

export interface AssessmentStatusBadge {
  variant: "default" | "destructive" | "outline" | "secondary";
  text: string;
}

export interface AssessmentScoreBadge {
  variant: "default" | "destructive" | "outline" | "secondary";
  label: string;
}
