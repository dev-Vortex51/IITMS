export interface EvaluationScore {
  technicalSkill: number;
  communication: number;
  professionalism: number;
  punctuality: number;
  problemSolving: number;
  workAttitude?: number;
  initiative?: number;
}

export interface Evaluation {
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
      email: string;
    };
  };
  type: "midterm" | "final";
  status: "draft" | "submitted" | "completed";
  technicalSkill: number;
  communication: number;
  professionalism: number;
  punctuality: number;
  problemSolving: number;
  workAttitude?: number;
  initiative?: number;
  totalScore?: number;
  grade?: string;
  strengths?: string;
  areasForImprovement?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentOption {
  id: string;
  matricNumber: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
