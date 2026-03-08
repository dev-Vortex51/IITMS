"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { apiClient } from "@/lib/api-client";
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

  const departmentStatsQuery = useQuery({
    queryKey: ["reports", "coordinator-department-stats", selectedDepartment],
    queryFn: async () => {
      const departments = departmentsData?.data || [];
      const targetDepartments =
        selectedDepartment === "all"
          ? departments
          : departments.filter((dept: any) => dept.id === selectedDepartment);

      const results = await Promise.all(
        targetDepartments.map(async (dept: any) => {
          const response = await apiClient.get(
            `/reports/departments/${dept.id}/statistics`,
          );
          return {
            id: dept.id,
            name: dept.name,
            ...(response.data?.data?.statistics || {}),
          };
        }),
      );

      return results;
    },
    enabled: !isLoadingDepartments,
  });

  const departments = departmentsData?.data || [];
  const departmentStats = useMemo(
    () => departmentStatsQuery.data || [],
    [departmentStatsQuery.data],
  );

  const isLoading = isLoadingDepartments || departmentStatsQuery.isLoading;

  // Calculate statistics from pre-aggregated department report data.
  const totalStudents = departmentStats.reduce(
    (sum: number, dept: any) => sum + (dept.totalStudents || 0),
    0,
  );
  const approvedPlacements = departmentStats.reduce(
    (sum: number, dept: any) => sum + (dept.placedStudents || 0),
    0,
  );
  const pendingPlacements = departmentStats.reduce(
    (sum: number, dept: any) => sum + (dept.pendingPlacements || 0),
    0,
  );
  const rejectedPlacements = 0;
  const totalSupervisors = departmentStats.reduce(
    (sum: number, dept: any) => sum + (dept.totalSupervisors || 0),
    0,
  );
  const placementRate =
    totalStudents > 0 ? `${Math.round((approvedPlacements / totalStudents) * 100)}%` : "0%";

  const filteredDepartmentStats = useMemo(
    () =>
      departmentStats.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        students: dept.totalStudents || 0,
        withPlacement: dept.placedStudents || 0,
      })),
    [departmentStats],
  );

  if (isLoading) {
    return <LoadingPage label="Loading reports..." />;
  }

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

      <ReportsExportOptions selectedDepartment={selectedDepartment} />

      <DepartmentBreakdownCard departmentStats={filteredDepartmentStats} />
    </div>
  );
}
