export interface SetupFormData {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phone: string;
  matricNumber: string;
  level: string;
  session: string;
  specialization: string;
  companyName: string;
  companyAddress: string;
  position: string;
  yearsOfExperience: string;
}

export interface InvitationData {
  email: string;
  role: string;
  companyName?: string;
  companyAddress?: string;
  position?: string;
  yearsOfExperience?: number;
}
