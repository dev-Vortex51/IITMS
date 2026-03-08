export type ComplianceFormType =
  | "acceptance_letter"
  | "introduction_letter"
  | "monthly_clearance"
  | "indemnity_form"
  | "itf_form_8"
  | "school_form"
  | "final_clearance";

export type ComplianceFormStatus = "draft" | "submitted" | "approved" | "rejected";

export interface ComplianceFormRecord {
  id: string;
  studentId: string;
  formType: ComplianceFormType;
  title?: string;
  status: ComplianceFormStatus;
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

export interface ComplianceTemplateItem {
  value: ComplianceFormType;
  label: string;
}
