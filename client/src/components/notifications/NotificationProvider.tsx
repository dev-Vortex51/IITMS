"use client";
import React, { createContext, useContext, useEffect } from "react";
import {
  notificationService,
  Notification,
} from "@/services/notification.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/components/providers/auth-provider";
import { API_URL } from "@/lib/api-client";

type NotificationContextType = {
  unreadCount: number;
  recent: Notification[];
  refetch: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  return ctx;
};

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: unreadCount = 0, refetch: refetchUnread } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationService.getUnreadCount,
    staleTime: 30_000,
    enabled: !!user,
  });

  const { data: recent = [], refetch: refetchRecent } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationService.getRecent(10),
    staleTime: 30_000,
    enabled: !!user,
  });

  const refetch = () => {
    refetchUnread();
    refetchRecent();
  };

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const token = window.localStorage.getItem("accessToken");
    if (!token) return;

    const socketBaseUrl = API_URL.replace(/\/api\/v1$/i, "").replace(
      /\/api$/i,
      "",
    );
    const socket: Socket = io(socketBaseUrl, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    socket.on("notification:new", (incoming: Notification) => {
      queryClient.setQueryData<Notification[]>(
        ["notifications", "recent"],
        (current = []) => [incoming, ...current].slice(0, 10),
      );
      queryClient.setQueryData<number>(
        ["notifications", "unread-count"],
        (current = 0) => current + (incoming.isRead ? 0 : 1),
      );
    });

    socket.on("notification:unread_count", (payload: { count: number }) => {
      if (typeof payload?.count === "number") {
        queryClient.setQueryData(["notifications", "unread-count"], payload.count);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, recent, refetch }}>
      {children}
    </NotificationContext.Provider>
  );
};
