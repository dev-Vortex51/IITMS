"use client";

import { DashboardShell } from "@/components/layouts/dashboard-shell";
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Users,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { title: "Placement", href: "/student/placement", icon: Briefcase },
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
    <DashboardShell navItems={navItems} title="Student Portal">
      {children}
    </DashboardShell>
  );
}
