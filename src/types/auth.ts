import { UserRole } from "@/lib/constants/roles";

export interface UserSessionProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthState {
  user: UserSessionProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface AdminAuthResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
