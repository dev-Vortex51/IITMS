import { apiClient } from "../lib/api-client";

export type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  createdAt: string;
  relatedModel?: string;
  relatedId?: string;
};

export const notificationService = {
  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get("/notifications/unread-count");
    return res.data?.data?.count ?? 0;
  },
  getRecent: async (limit = 10): Promise<Notification[]> => {
    const res = await apiClient.get(`/notifications?limit=${limit}`);
    return res.data?.data ?? [];
  },
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put(`/notifications/read-all`);
  },
};
