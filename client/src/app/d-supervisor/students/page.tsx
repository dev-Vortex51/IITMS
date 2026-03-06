"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Eye, Search, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { apiClient } from "@/lib/api-client";
import {
  ActionMenu,
  AtlassianTable,
  DashboardMetricsGrid,
  ErrorLocalState,
  FilterBar,
  FilterFieldSearch,
  LoadingPage,
  PageHeader,
  StatusBadge,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";

export default function DSupervisorStudentsPage() {
  useEffect(() => {
    document.title = "My Students | ITMS";
  }, []);

  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const supervisorId = user?.profileData?.id;

  const { data: dashboardData, isLoading, isError, refetch } = useQuery({
    queryKey: ["supervisor-dashboard", supervisorId],
    queryFn: async () => {
      const response = await apiClient.get(`/supervisors/${supervisorId}/dashboard`);
      return response.data.data;
    },
    enabled: !!supervisorId,
  });

  const students = useMemo(
    () => dashboardData?.supervisor?.assignedStudents || [],
    [dashboardData],
  );
  const pendingLogbooks = dashboardData?.statistics?.pendingLogbooks || 0;

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return students;

    return students.filter((student: any) => {
      const fullName = `${student.user?.firstName || ""} ${student.user?.lastName || ""}`
        .trim()
        .toLowerCase();
      return (
        fullName.includes(query) ||
        student.matricNumber?.toLowerCase().includes(query) ||
        student.user?.email?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, students]);

  const activePlacements = students.filter(
    (student: any) => student.currentPlacement?.status === "approved",
  ).length;
  const noPlacement = students.filter((student: any) => !student.currentPlacement).length;

  const metrics = [
    {
      label: "Total Students",
      value: students.length,
      hint: "Students assigned to you",
      trend: "up" as const,
    },
    {
      label: "Active Placements",
      value: activePlacements,
      hint: "Students with approved placement",
      trend: "up" as const,
    },
    {
      label: "Pending Logbooks",
      value: pendingLogbooks,
      hint: "Entries waiting for your review",
      trend: pendingLogbooks > 0 ? ("down" as const) : ("up" as const),
    },
    {
      label: "No Placement",
      value: noPlacement,
      hint: "Students yet to secure placement",
      trend: "neutral" as const,
    },
  ];

  if (isLoading) {
    return <LoadingPage label="Loading students..." />;
  }

  if (isError) {
    return (
      <div className="space-y-4 md:space-y-5">
        <PageHeader
          title="My Students"
          description="Monitor assigned students, placement status, and review workload."
        />
        <ErrorLocalState
          message="Student records could not be loaded."
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="My Students"
        description="Monitor assigned students, placement status, and review workload."
        actions={
          <Button asChild className="h-9">
            <Link href="/d-supervisor/logbooks">
              <BookOpen className="mr-2 h-4 w-4" />
              Review Logbooks
            </Link>
          </Button>
        }
      />

      <DashboardMetricsGrid items={metrics} />

      <FilterBar>
        <FilterFieldSearch
          placeholder="Search by student name, matric number, or email"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-md"
        />
      </FilterBar>

      <AtlassianTable
        title="Assigned Students"
        subtitle={`${filteredStudents.length} record${filteredStudents.length === 1 ? "" : "s"}`}
        data={filteredStudents}
        rowKey={(student: any) => student.id}
        columns={[
          {
            id: "student",
            header: "Student",
            sortable: true,
            sortAccessor: (student: any) =>
              `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim(),
            render: (student: any) => (
              <div className="flex items-center gap-2.5">
                <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {student.user?.firstName} {student.user?.lastName}
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: "matricNumber",
            header: "Matric Number",
            sortable: true,
            sortAccessor: (student: any) => student.matricNumber || "",
            render: (student: any) => (
              <span className="text-sm text-foreground">{student.matricNumber || "N/A"}</span>
            ),
          },
          {
            id: "level",
            header: "Level",
            sortable: true,
            sortAccessor: (student: any) => student.level || 0,
            render: (student: any) => (
              <span className="text-sm text-foreground">{student.level ? `${student.level}` : "N/A"}</span>
            ),
          },
          {
            id: "placement",
            header: "Placement",
            render: (student: any) => (
              <StatusBadge status={student.currentPlacement?.status || "No Placement"} />
            ),
          },
          {
            id: "actions",
            header: "",
            align: "right",
            width: 56,
            render: (student: any) => (
              <ActionMenu
                items={[
                  {
                    label: "View Student",
                    href: `/d-supervisor/students/${student.id}`,
                    icon: <Eye className="h-3.5 w-3.5" />,
                  },
                  {
                    label: "Review Logbooks",
                    href: `/d-supervisor/logbooks?student=${student.id}`,
                    icon: <Search className="h-3.5 w-3.5" />,
                  },
                ]}
              />
            ),
          },
        ]}
        emptyTitle={searchQuery ? "No Students Found" : "No Students Assigned"}
        emptyDescription={
          searchQuery
            ? "Try adjusting your search query."
            : "Students will appear here once assigned to you."
        }
        emptyIcon={<Users className="h-6 w-6 text-accent-foreground" />}
      />
    </div>
  );
}
