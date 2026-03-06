"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorLocalState, LoadingPage, PageHeader } from "@/components/design-system";
import { notificationService, type Notification } from "@/services/notification.service";

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

export function NotificationsPageContent() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: () => notificationService.getNotifications({ limit: 100 }),
  });

  const notifications = useMemo(() => data?.notifications || [], [data]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead) return;
    await notificationService.markAsRead(notification.id);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    refetch();
  };

  const handleMarkAllRead = async () => {
    if (unreadCount <= 0) return;
    await notificationService.markAllAsRead();
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    refetch();
  };

  if (isLoading) {
    return <LoadingPage label="Loading notifications..." />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Notifications"
          description="Activity, approvals, reminders, and updates across your workspace."
        />
        <ErrorLocalState
          title="Unable to load notifications"
          message="Notification data could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        description="Activity, approvals, reminders, and updates across your workspace."
        actions={
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            size="sm"
            className={`${actionButtonClass} gap-2`}
            disabled={unreadCount <= 0}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        }
      />

      <Card className="border-border/70">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Inbox
            <Badge variant="secondary" className="ml-1">
              {unreadCount} unread
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start justify-between gap-4 p-4 ${
                    item.isRead ? "bg-transparent" : "bg-primary/5"
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {typeLabelMap[item.type] || "Notification"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    {item.actionLink ? (
                      <a
                        href={item.actionLink}
                        className="inline-block text-xs text-primary hover:underline"
                      >
                        {item.actionText || "Open"}
                      </a>
                    ) : null}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${actionButtonClass} shrink-0 gap-1`}
                    disabled={item.isRead}
                    onClick={() => handleMarkRead(item)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {item.isRead ? "Read" : "Mark read"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
