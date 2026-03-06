export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface InvitationFormData {
  email: string;
  role: string;
  department: string;
}

export interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
  cancelled: number;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  invitedBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}
