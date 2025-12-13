"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  notificationService,
  Notification,
} from "../../services/notification.service";
import { useQuery } from "@tanstack/react-query";

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
  const { data: unreadCount = 0, refetch: refetchUnread } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationService.getUnreadCount,
    staleTime: 30_000,
  });

  const { data: recent = [], refetch: refetchRecent } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationService.getRecent(10),
    staleTime: 30_000,
  });

  const refetch = () => {
    refetchUnread();
    refetchRecent();
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, recent, refetch }}>
      {children}
    </NotificationContext.Provider>
  );
};
