export type UserRole =
  | "admin"
  | "coordinator"
  | "academic_supervisor"
  | "industrial_supervisor"
  | "student";

export interface ProfileData {
  _id: string;
  user?: string;
  department?: any;
  // Student-specific fields
  currentPlacement?: any;
  academicSupervisor?: any;
  departmentalSupervisor?: any; // Backward compatibility
  industrialSupervisor?: any;
  // Supervisor-specific fields
  assignedStudents?: any[];
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  name?: string;
  passwordResetRequired: boolean;
  faculty?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
  profileData?: ProfileData;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?:
    | {
        accessToken: string;
        user: User;
      }
    | {
        requiresPasswordReset: boolean;
        userId: string;
        email: string;
        tempToken: string;
      };
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
}
