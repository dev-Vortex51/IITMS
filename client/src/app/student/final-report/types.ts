export type TechnicalReportStatus = "draft" | "submitted" | "approved" | "rejected";

export interface TechnicalReportRecord {
  id: string;
  studentId: string;
  title?: string;
  abstract?: string;
  status: TechnicalReportStatus;
  documentName?: string;
  documentPath?: string;
  note?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    departmentId?: string;
    matricNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}
