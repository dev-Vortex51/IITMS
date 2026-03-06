import { apiClient } from "@/lib/api-client";

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  createdAt: string;
  relatedModel?: string;
  relatedId?: string;
  actionLink?: string;
  actionText?: string;
};

export const notificationService = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
    priority?: string;
  }): Promise<{ notifications: Notification[]; pagination?: any }> => {
    const res = await apiClient.get("/notifications", { params });
    return {
      notifications: res.data?.data ?? [],
      pagination: res.data?.pagination,
    };
  },
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
