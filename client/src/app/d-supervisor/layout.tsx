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
    href: "/d-supervisor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Students",
    href: "/d-supervisor/students",
    icon: Users,
  },
  {
    title: "Logbooks",
    href: "/d-supervisor/logbooks",
    icon: BookOpen,
  },
  {
    title: "Assessments",
    href: "/d-supervisor/assessments",
    icon: ClipboardCheck,
  },
  {
    title: "Settings",
    href: "/d-supervisor/settings",
    icon: Settings,
  },
];

export default function DepartmentalSupervisorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell
      title="Departmental Supervisor Dashboard"
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
