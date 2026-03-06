export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Student {
  id?: string;
  _id?: string;
  user?: UserProfile;
  firstName?: string;
  lastName?: string;
  matricNumber: string;
  logbooks: Logbook[];
  totalLogbooks: number;
  pendingReview: number;
  approved: number;
  rejected: number;
}

export interface ReviewStatus {
  status?: string;
  rating?: number;
  comment?: string;
}

export interface LogbookReview {
  supervisorType?: string;
  rating?: number;
  comment?: string;
}

export interface LogbookEvidence {
  path: string;
  name: string;
}

export interface Logbook {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  submittedAt?: string;
  status?: string;
  departmentalReviewStatus?: string;
  industrialReviewStatus?: string;
  tasksPerformed?: string;
  skillsAcquired?: string;
  challenges?: string;
  lessonsLearned?: string;
  evidence?: LogbookEvidence[];
  reviews?: LogbookReview[];
  industrialReview?: ReviewStatus;
  departmentalReview?: ReviewStatus;
}

export type DepartmentalReviewDecision = "approved" | "rejected";

export interface LogbookStatusBadge {
  variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary";
  text: string;
}
