import { apiClient } from "@/lib/api-client";
import { LoginCredentials, LoginResponse, User } from "@/types/auth";
import Cookies from "js-cookie";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.data.success && response.data.data?.accessToken) {
      Cookies.set("accessToken", response.data.data.accessToken, {
        expires: 7,
      });
    }
    return response.data;
  },

  getProfile: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get("/auth/profile");
      return response.data.data;
    } catch (error: any) {
      console.error(
        "getProfile error:",
        error.response?.status,
        error.response?.data || error.message
      );
      return null;
    }
  },

  resetPasswordWithToken: async (
    token: string,
    password: string
  ): Promise<void> => {
    await apiClient.post("/auth/reset-password", { token, password });
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    await apiClient.post("/auth/change-password", { oldPassword, newPassword });
  },

  logout: () => {
    Cookies.remove("accessToken");
  },
};
