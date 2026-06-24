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
import { isForceLogoutPending } from "@/lib/session";

type NotificationContextType = {
  unreadCount: number;
  recent: Notification[];
  refetch: () => Promise<void>;
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
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const { data: recent = [], refetch: refetchRecent } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationService.getRecent(10),
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const refetch = async () => {
    await Promise.all([refetchUnread(), refetchRecent()]);
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

    socket.on("force_logout", (payload: { tokenVersion?: number }) => {
      // If this device initiated the logout (flag set by LogoutAllDevicesButton),
      // ignore the event — we already have a fresh token.
      if (isForceLogoutPending()) return;

      if (typeof window === "undefined") return;

      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.removeItem("itms:userCache");
      document.cookie = "accessToken=; Path=/; Max-Age=0; SameSite=Lax";

      const message = payload?.tokenVersion
        ? "Your session has been terminated on another device."
        : "Your password was changed. Please log in again.";
      (window as any).__sessionExpiredMessage = message;
      window.location.href = "/login";
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
