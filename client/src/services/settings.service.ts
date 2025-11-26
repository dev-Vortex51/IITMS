import { apiClient } from "@/lib/api-client";

export interface SystemSettings {
  _id?: string;
  currentSession: string;
  semester: string;
  siweDuration: number;
  minWeeks: number;
  autoAssignSupervisors: boolean;
  requireLogbookApproval: boolean;
}

export interface NotificationPreferences {
  _id?: string;
  user?: string;
  emailNotifications: boolean;
  placementAlerts: boolean;
  systemUpdates: boolean;
}

export const settingsService = {
  // System Settings
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await apiClient.get("/settings/system");
    return response.data.data;
  },

  updateSystemSettings: async (
    settings: Partial<SystemSettings>
  ): Promise<SystemSettings> => {
    const response = await apiClient.put("/settings/system", settings);
    return response.data.data;
  },

  // Notification Preferences
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get("/settings/notifications");
    return response.data.data;
  },

  updateNotificationPreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    const response = await apiClient.put(
      "/settings/notifications",
      preferences
    );
    return response.data.data;
  },
};
