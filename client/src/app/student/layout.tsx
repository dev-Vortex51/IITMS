"use client";

import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { NotificationProvider } from "../../components/notifications/NotificationProvider";
import { NotificationsDropdown } from "../../components/notifications/NotificationsDropdown";
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Users,
  FileText,
  Settings,
  Calendar,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { title: "Placement", href: "/student/placement", icon: Briefcase },
  { title: "Attendance", href: "/student/attendance", icon: Calendar },
  { title: "Logbook", href: "/student/logbook", icon: BookOpen },
  { title: "Supervisors", href: "/student/supervisors", icon: Users },
  { title: "Settings", href: "/student/settings", icon: Settings },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <DashboardShell navItems={navItems} title="Student Dashboard">
        <div className="flex justify-end mb-2">
          <NotificationsDropdown />
        </div>
        {children}
      </DashboardShell>
    </NotificationProvider>
  );
}
