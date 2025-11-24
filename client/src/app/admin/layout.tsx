"use client";

import { ReactNode } from "react";
import DashboardShell from "@/components/layouts/dashboard-shell";
import {
  LayoutDashboard,
  Building,
  School,
  UserCog,
  FileBarChart,
  Settings,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
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
    <DashboardShell title="Admin Dashboard" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
