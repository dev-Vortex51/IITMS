"use client";

import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Users,
  Settings,
  Calendar,
  FileCheck2,
  FileText,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { title: "Placement", href: "/student/placement", icon: Briefcase },
  { title: "Attendance", href: "/student/attendance", icon: Calendar },
  { title: "Compliance", href: "/student/compliance", icon: FileCheck2 },
  { title: "Final Report", href: "/student/final-report", icon: FileText },
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
        {children}
      </DashboardShell>
    </NotificationProvider>
  );
}
