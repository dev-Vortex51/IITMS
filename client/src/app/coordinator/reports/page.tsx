"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { studentService, placementService } from "@/services/student.service";
import {
  DashboardMetricsGrid,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { DepartmentBreakdownCard } from "./components/DepartmentBreakdownCard";
import { ReportsExportOptions } from "./components/ReportsExportOptions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CoordinatorReportsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  // Fetch departments
  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => adminService.departmentService.getAllDepartments(),
  });

  // Fetch all students
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getAllStudents(),
  });

  // Fetch all placements
  const { data: placementsData, isLoading: isLoadingPlacements } = useQuery({
    queryKey: ["placements"],
    queryFn: () => placementService.getAllPlacements({}),
  });

  // Fetch supervisors
  const { data: dSupervisorsData, isLoading: isLoadingDSupervisors } = useQuery({
    queryKey: ["supervisors", "departmental"],
    queryFn: () =>
      adminService.supervisorService.getAllSupervisors({
        type: "departmental",
      }),
  });

  const { data: iSupervisorsData, isLoading: isLoadingISupervisors } = useQuery({
    queryKey: ["supervisors", "industrial"],
    queryFn: () =>
      adminService.supervisorService.getAllSupervisors({ type: "industrial" }),
  });

  const departments = departmentsData?.data || [];
  const students = studentsData?.data || [];
  const placements = placementsData?.data || [];
  const departmentalSupervisors = dSupervisorsData?.data || [];
  const industrialSupervisors = iSupervisorsData?.data || [];

  const isLoading =
    isLoadingDepartments ||
    isLoadingStudents ||
    isLoadingPlacements ||
    isLoadingDSupervisors ||
    isLoadingISupervisors;

  if (isLoading) {
    return <LoadingPage label="Loading reports..." />;
  }

  // Calculate statistics
  const totalStudents = students.length;
  const approvedPlacements = placements.filter(
    (p: any) => p.status === "approved",
  ).length;
  const pendingPlacements = placements.filter(
    (p: any) => p.status === "pending",
  ).length;
  const rejectedPlacements = placements.filter(
    (p: any) => p.status === "rejected",
  ).length;
  const totalSupervisors = departmentalSupervisors.length + industrialSupervisors.length;
  const placementRate =
    totalStudents > 0 ? `${Math.round((approvedPlacements / totalStudents) * 100)}%` : "0%";

  const departmentStats = departments.map((dept: any) => {
    const deptStudents = students.filter((s: any) => {
      if (typeof s.department === "object") {
        if (s.department.code && dept.code) {
          return s.department.code === dept.code;
        }
        if (s.department.name && dept.name) {
          return s.department.name === dept.name;
        }
      }

      if (typeof s.department === "string") {
        if (dept.code) return s.department === dept.code;
        if (dept.name) return s.department === dept.name;
      }

      return false;
    });

    return {
      id: dept.id,
      name: dept.name,
      students: deptStudents.length,
      withPlacement: deptStudents.filter((s: any) => s.placement).length,
    };
  });

  const filteredDepartmentStats =
    selectedDepartment === "all"
      ? departmentStats
      : departmentStats.filter((dept: any) => dept.id === selectedDepartment);

  const metrics = [
    {
      label: "Total Students",
      value: totalStudents,
      hint: "Students across coordinator scope",
      trend: "neutral" as const,
    },
    {
      label: "Approved Placements",
      value: approvedPlacements,
      hint: "Placement approvals completed",
      trend: "up" as const,
    },
    {
      label: "Pending Placements",
      value: pendingPlacements,
      hint: "Awaiting coordinator review",
      trend: "up" as const,
    },
    {
      label: "Placement Rate",
      value: placementRate,
      hint: "Approved placements out of students",
      trend: "up" as const,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Reports & Analytics"
        description="Operational overview, placement health, and departmental distribution."
      />

      <DashboardMetricsGrid items={metrics} />

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>Select a department focus for breakdown data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full md:max-w-md">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Placement pipeline: {pendingPlacements} pending, {rejectedPlacements} rejected,{" "}
              {totalSupervisors} supervisors.
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportsExportOptions />

      <DepartmentBreakdownCard departmentStats={filteredDepartmentStats} />
    </div>
  );
}
