export interface Student {
  id?: string;
  _id?: string;
  matricNumber: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  logbooks?: Logbook[];
  totalLogbooks?: number;
  pendingReview?: number;
  reviewed?: number;
}

export interface LogbookReview {
  supervisorType?: string;
  status?: string;
  comment?: string;
  rating?: number;
  reviewedAt?: string;
}

export interface LogbookEvidence {
  name: string;
  path: string;
}

export interface Logbook {
  id: string;
  studentId: string;
  _id?: string;
  student?: Student;
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasksPerformed: string;
  skillsAcquired?: string;
  challenges?: string;
  lessonsLearned?: string;
  evidence?: LogbookEvidence[];
  industrialReview?: LogbookReview;
  industrialReviewStatus?: string;
  departmentalReview?: LogbookReview;
  reviews?: LogbookReview[];
  status: string;
  submittedAt?: string;
  createdAt?: string;
}
