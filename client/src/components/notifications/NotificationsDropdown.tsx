"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNotifications } from "./NotificationProvider";
import { Bell, Check } from "lucide-react";
import { notificationService } from "@/services/notification.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionIcon, Indicator } from "@mantine/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  applyMarkAllAsReadToCache,
  applyMarkAsReadToCache,
} from "./cache-updates";

const typeLabelMap: Record<string, string> = {
  invite_sent: "Invite",
  invite_accepted: "Invite",
  password_reset_requested: "Security",
  password_changed: "Security",
  placement_submitted: "Placement",
  placement_updated: "Placement",
  placement_approved: "Placement",
  placement_rejected: "Placement",
  logbook_submitted: "Logbook",
  logbook_reviewed: "Logbook",
  logbook_rejected_by_industrial: "Logbook",
  logbook_approved_final: "Logbook",
  logbook_rejected_final: "Logbook",
  attendance_checked_in: "Attendance",
  absence_request_submitted: "Attendance",
  attendance_approved: "Attendance",
  attendance_rejected: "Attendance",
  attendance_reclassified: "Attendance",
  supervisor_assigned: "Assignment",
  supervisor_unassigned: "Assignment",
  assessment_assigned: "Assessment",
  assessment_submitted: "Assessment",
  assessment_reviewed: "Assessment",
  assessment_deadline_reminder: "Assessment",
  deadline_reminder: "Reminder",
  broadcast_announcement: "Announcement",
  account_created: "Account",
  password_reset: "Security",
  general: "General",
};

const actionButtonClass =
  "h-9 rounded-md border-border/70 bg-white px-3 text-foreground hover:bg-accent hover:text-accent-foreground";
const headerControlClass =
  "h-9 w-9 rounded-full bg-muted/40 text-muted-foreground hover:bg-accent hover:text-accent-foreground";

export const NotificationsDropdown: React.FC = () => {
  const pathname = usePathname();
  const { recent, unreadCount } = useNotifications();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
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
      document.addEventListener("pointerdown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      applyMarkAllAsReadToCache(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["notifications", "all"],
        exact: true,
      });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (_, id) => {
      applyMarkAsReadToCache(queryClient, id);
      queryClient.invalidateQueries({
        queryKey: ["notifications", "all"],
        exact: true,
      });
    },
  });

  const handleMarkAll = async () => {
    if (unreadCount <= 0 || markAllMutation.isPending) return;
    markAllMutation.mutate();
  };

  const handleOpenNotification = async (id: string, isRead: boolean) => {
    if (!isRead && !markOneMutation.isPending) {
      markOneMutation.mutate(id);
    }
    setOpen(false);
  };

  const handleToggle = () => setOpen((o) => !o);
  const basePath = pathname?.split("/")[1] ? `/${pathname.split("/")[1]}` : "";
  const notificationPath = basePath ? `${basePath}/notification` : "/notification";

  return (
    <div className="relative" ref={containerRef}>
      <ActionIcon
        onClick={handleToggle}
        size="lg"
        radius="xl"
        variant="default"
        className={headerControlClass}
        aria-label="Show notifications"
      >
        <Indicator
          inline
          disabled={unreadCount <= 0}
          label=""
          size={8}
          color="red"
          offset={3}
        >
          <Bell className="h-4 w-4" />
        </Indicator>
      </ActionIcon>

      {open && (
        <div className="fixed inset-x-2 top-[4.25rem] z-50 rounded-md border bg-white shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:max-w-[calc(100vw-1rem)]">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">Notifications</span>
            <Button
              onClick={handleMarkAll}
              variant="outline"
              size="sm"
              className={`${actionButtonClass} text-xs`}
              disabled={unreadCount <= 0 || markAllMutation.isPending}
            >
              {markAllMutation.isPending ? "Updating..." : "Mark all as read"}
            </Button>
          </div>
          <div className="max-h-64 overflow-auto">
            {recent.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              recent.map((n) => (
                <div key={n.id} className="px-3 py-2 border-b last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    {!n.isRead && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {typeLabelMap[n.type] || "Notification"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {n.message}
                  </p>
                  {n.actionLink ? (
                    <Link
                      className="mt-1 inline-block text-[11px] text-primary hover:underline"
                      href={n.actionLink}
                      onClick={() => {
                        void handleOpenNotification(n.id, n.isRead);
                      }}
                    >
                      {n.actionText || "Open"}
                    </Link>
                  ) : null}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="border-t px-3 py-2">
            <Link
              href={notificationPath}
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
