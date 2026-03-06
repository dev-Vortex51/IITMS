import type { QueryClient } from "@tanstack/react-query";
import type { Notification } from "@/services/notification.service";

type NotificationsAllData = {
  notifications: Notification[];
  pagination?: any;
};

export function applyMarkAllAsReadToCache(queryClient: QueryClient) {
  queryClient.setQueryData<Notification[]>(["notifications", "recent"], (current = []) =>
    current.map((item) =>
      item.isRead ? item : { ...item, isRead: true },
    ),
  );

  queryClient.setQueryData<NotificationsAllData>(
    ["notifications", "all"],
    (current) =>
      current
        ? {
            ...current,
            notifications: current.notifications.map((item) =>
              item.isRead ? item : { ...item, isRead: true },
            ),
          }
        : current,
  );

  queryClient.setQueryData<number>(["notifications", "unread-count"], 0);
}

export function applyMarkAsReadToCache(queryClient: QueryClient, id: string) {
  queryClient.setQueryData<Notification[]>(["notifications", "recent"], (current = []) =>
    current.map((item) =>
      item.id === id && !item.isRead ? { ...item, isRead: true } : item,
    ),
  );

  queryClient.setQueryData<NotificationsAllData>(
    ["notifications", "all"],
    (current) =>
      current
        ? {
            ...current,
            notifications: current.notifications.map((item) =>
              item.id === id && !item.isRead ? { ...item, isRead: true } : item,
            ),
          }
        : current,
  );

  queryClient.setQueryData<number>(
    ["notifications", "unread-count"],
    (current = 0) => Math.max(0, current - 1),
  );
}
