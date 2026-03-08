"use client";

import { ReactNode } from "react";
import DashboardShell from "@/components/layouts/dashboard-shell";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardCheck,
  UserCheck,
  FileText,
  Settings,
  Mail,
  CalendarDays,
  FileCheck2,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/coordinator/dashboard", icon: LayoutDashboard },
  { title: "Invitations", href: "/coordinator/invitations", icon: Mail },
  { title: "Students", href: "/coordinator/students", icon: Users },
  { title: "Placements", href: "/coordinator/placements", icon: Briefcase },
  { title: "Evaluations", href: "/coordinator/evaluations", icon: ClipboardCheck },
  { title: "Supervisors", href: "/coordinator/supervisors", icon: UserCheck },
  { title: "Visits", href: "/coordinator/visits", icon: CalendarDays },
  { title: "Compliance", href: "/coordinator/compliance", icon: FileCheck2 },
  { title: "Final Reports", href: "/coordinator/final-reports", icon: GraduationCap },
  { title: "Reports", href: "/coordinator/reports", icon: FileText },
  { title: "Settings", href: "/coordinator/settings", icon: Settings },
];

export default function CoordinatorLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <DashboardShell title="Coordinator Dashboard" navItems={navItems}>
        {children}
      </DashboardShell>
    </NotificationProvider>
  );
}
