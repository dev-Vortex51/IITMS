export interface PlacementFormData {
  companyName: string;
  companyAddress: string;
  companySector: string;
  companyEmail: string;
  companyPhone: string;
  position: string;
  startDate: string;
  endDate: string;
  supervisorName: string;
  supervisorEmail: string;
  supervisorPhone: string;
  supervisorPosition: string;
}

export type PlacementStatus = "approved" | "pending" | "rejected" | "withdrawn" | string;
