"use client";
import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "./NotificationProvider";
import { Bell, Check } from "lucide-react";
import { notificationService } from "../../services/notification.service";
import { useQueryClient } from "@tanstack/react-query";

export const NotificationsDropdown: React.FC = () => {
  const { recent, unreadCount, refetch } = useNotifications();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    refetch();
  };

  const handleToggle = () => setOpen((o) => !o);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="relative inline-flex items-center"
        aria-label="Show notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">Notifications</span>
            <button
              onClick={handleMarkAll}
              className="text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-64 overflow-auto">
            {recent.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              recent.map((n) => (
                <div key={n._id} className="px-3 py-2 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{n.title}</span>
                    {!n.read && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
