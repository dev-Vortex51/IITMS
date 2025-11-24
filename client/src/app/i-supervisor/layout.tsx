"use client";

import { ReactNode } from "react";
import DashboardShell from "@/components/layouts/dashboard-shell";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  FileText,
  Settings,
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
    title: "Assessments",
    href: "/i-supervisor/assessments",
    icon: ClipboardCheck,
  },
  {
    title: "Reports",
    href: "/i-supervisor/reports",
    icon: FileText,
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
    <DashboardShell title="Industrial Supervisor Dashboard" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
