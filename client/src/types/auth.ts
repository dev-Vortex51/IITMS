export type UserRole =
  | "admin"
  | "coordinator"
  | "departmental_supervisor"
  | "industrial_supervisor"
  | "student";

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  name?: string;
  isFirstLogin: boolean;
  passwordResetRequired: boolean;
  faculty?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
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
        isFirstLogin: boolean;
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
