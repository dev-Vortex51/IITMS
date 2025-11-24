"use client";

import { ReactNode } from "react";
import DashboardShell from "@/components/layouts/dashboard-shell";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  UserCheck,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/coordinator/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/coordinator/students",
    icon: Users,
  },
  {
    title: "Placements",
    href: "/coordinator/placements",
    icon: Briefcase,
  },
  {
    title: "Logbooks",
    href: "/coordinator/logbooks",
    icon: BookOpen,
  },
  {
    title: "Supervisors",
    href: "/coordinator/supervisors",
    icon: UserCheck,
  },
  {
    title: "Reports",
    href: "/coordinator/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/coordinator/settings",
    icon: Settings,
  },
];

export default function CoordinatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell title="Coordinator Dashboard" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
