export interface AssessmentScore {
  technical: number;
  communication: number;
  punctuality: number;
  initiative: number;
  teamwork: number;
  professionalism?: number;
  problemSolving?: number;
  adaptability?: number;
}

export interface Assessment {
  id: string;
  student: {
    id: string;
    matricNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  supervisor: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  type: "midterm" | "final" | string;
  scores: AssessmentScore;
  strengths?: string;
  areasForImprovement?: string;
  comment?: string;
  recommendation: "excellent" | "very_good" | "good" | "fair" | "poor" | string;
  grade?: string;
  status: "pending" | "submitted" | "approved" | "rejected" | string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  matricNumber: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
