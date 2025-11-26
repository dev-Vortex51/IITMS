"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import { AuthContextType, LoginCredentials, User } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check for token on client side only
  const hasToken = isMounted ? !!Cookies.get("accessToken") : false;

  // Fetch user profile
  const {
    data: user,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const profile = await authService.getProfile();
      console.log("Query function result:", profile);
      if (!profile) {
        throw new Error("Failed to load user profile");
      }
      return profile;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isMounted && hasToken,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: async (data) => {
      if (data.success && data.data) {
        // Check if password reset is required
        if (
          "requiresPasswordReset" in data.data &&
          data.data.requiresPasswordReset
        ) {
          // Store userId in session storage for password reset
          if ("userId" in data.data) {
            sessionStorage.setItem("resetUserId", data.data.userId);
          }
          router.push("/reset-password");
          return;
        }

        // Normal login flow
        if ("user" in data.data) {
          const { user } = data.data;

          // Handle first login or password reset (backup check)
          if (user.isFirstLogin || user.passwordResetRequired) {
            sessionStorage.setItem("resetUserId", user._id);
            router.push("/reset-password");
            return;
          }

          // Redirect based on role
          const roleRoutes: Record<string, string> = {
            admin: "/admin/dashboard",
            coordinator: "/coordinator/dashboard",
            departmental_supervisor: "/d-supervisor/dashboard",
            industrial_supervisor: "/i-supervisor/dashboard",
            student: "/student/dashboard",
          };

          const redirectPath = roleRoutes[user.role] || "/";
          await refetch();
          router.push(redirectPath);
        }
      }
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    authService.logout();
    queryClient.clear();
  };

  const refetchUser = () => {
    refetch();
  };

  // Debug logging
  useEffect(() => {
    console.log("Auth state updated:", { user, isLoading, hasToken, error });
  }, [user, isLoading, hasToken, error]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: !isMounted || isLoading,
        login,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
