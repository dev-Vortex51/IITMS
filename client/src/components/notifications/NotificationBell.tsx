"use client";
import React from "react";
import { useNotifications } from "./NotificationProvider";
import { Bell } from "lucide-react";

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();

  return (
    <div className="relative inline-flex items-center">
      <Bell
        aria-label="Notifications"
        className="h-5 w-5 text-muted-foreground"
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
          {unreadCount}
        </span>
      )}
    </div>
  );
};
