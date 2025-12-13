"use client";

import { ReactNode } from "react";
import DashboardShell from "@/components/layouts/dashboard-shell";
import { NotificationProvider } from "../../components/notifications/NotificationProvider";
import { NotificationsDropdown } from "../../components/notifications/NotificationsDropdown";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  Clock,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/i-supervisor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Students",
    href: "/i-supervisor/students",
    icon: Users,
  },
  {
    title: "Logbooks",
    href: "/i-supervisor/logbooks",
    icon: BookOpen,
  },
  {
    title: "Attendance",
    href: "/i-supervisor/attendance",
    icon: Clock,
  },
  {
    title: "Settings",
    href: "/i-supervisor/settings",
    icon: Settings,
  },
];

export default function IndustrialSupervisorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <NotificationProvider>
      <DashboardShell
        title="Industrial Supervisor Dashboard"
        navItems={navItems}
      >
        <div className="flex justify-end mb-2">
          <NotificationsDropdown />
        </div>
        {children}
      </DashboardShell>
    </NotificationProvider>
  );
}
