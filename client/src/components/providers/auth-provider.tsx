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
import { authService } from "@/services/auth.service";
import { AuthContextType, LoginCredentials, User } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ACCESS_TOKEN_COOKIE = "accessToken";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
  return value || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token =
      window.localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_COOKIE);
    setHasAuthToken(Boolean(token));
  }, []);

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const profile = await authService.getProfile();
      if (!profile) {
        throw new Error("Failed to load user profile");
      }
      return profile;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: isMounted && hasAuthToken,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: async (data) => {
      if (data.success && data.data && "user" in data.data) {
        const { user, accessToken, refreshToken } = data.data;

        if (typeof window !== "undefined") {
          window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          if (refreshToken) {
            window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          }
          document.cookie = `accessToken=${accessToken}; Path=/; Max-Age=604800; SameSite=Lax`;
          setHasAuthToken(true);
        }

        queryClient.setQueryData(["user"], user);

        const roleRoutes: Record<string, string> = {
          admin: "/admin/dashboard",
          coordinator: "/coordinator/dashboard",
          academic_supervisor: "/d-supervisor/dashboard",
          departmental_supervisor: "/d-supervisor/dashboard",
          industrial_supervisor: "/i-supervisor/dashboard",
          student: "/student/dashboard",
        };

        const redirectPath = roleRoutes[user.role] || "/";
        router.replace(redirectPath);
      }
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await authService.logout();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      document.cookie = "accessToken=; Path=/; Max-Age=0; SameSite=Lax";
      setHasAuthToken(false);
    }
    queryClient.clear();
    router.push("/login");
  };

  const refetchUser = () => {
    refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: !isMounted || (hasAuthToken && isLoading),
        login,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
