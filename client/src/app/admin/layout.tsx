"use client";

import { ReactNode } from "react";
import DashboardShell from "@/components/layouts/dashboard-shell";
import { NotificationProvider } from "../../components/notifications/NotificationProvider";
import { NotificationsDropdown } from "../../components/notifications/NotificationsDropdown";
import {
  LayoutDashboard,
  Building,
  School,
  UserCog,
  FileBarChart,
  Settings,
  Users,
  Mail,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Invitations",
    href: "/admin/invitations",
    icon: Mail,
  },
  {
    title: "Faculties",
    href: "/admin/faculties",
    icon: School,
  },
  {
    title: "Departments",
    href: "/admin/departments",
    icon: Building,
  },
  {
    title: "Coordinators",
    href: "/admin/coordinators",
    icon: UserCog,
  },
  {
    title: "Academic Supervisors",
    href: "/admin/academic-supervisors",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileBarChart,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <DashboardShell title="Admin Dashboard" navItems={navItems}>
        <div className="flex justify-end mb-2">
          <NotificationsDropdown />
        </div>
        {children}
      </DashboardShell>
    </NotificationProvider>
  );
}
