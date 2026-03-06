"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { useDepartmentsLogic } from "./_hooks/useDepartmentsLogic";
import { DashboardMetricsGrid, LoadingPage, PageHeader } from "@/components/design-system";
import CreateDepartment from "./_components/CreateDepartment";
import AssignCoordinator from "./_components/AssignCoordinator";
import DepartmentsTable from "./_components/DepartmentsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function DepartmentsPage() {
  const { state, setters, queries, mutations } = useDepartmentsLogic();
  const [selectedDeptForAssign, setSelectedDeptForAssign] = useState<any>(null);

  const departments = useMemo(
    () => queries.departmentsQuery.data?.data || [],
    [queries.departmentsQuery.data],
  );
  const faculties = useMemo(
    () => queries.facultiesQuery.data?.data || [],
    [queries.facultiesQuery.data],
  );
  const meta = queries.departmentsQuery.data?.meta || {};

  const totalCount = meta.totalItems || meta.totalCount || departments.length;
  const totalPages =
    meta.totalPages || Math.ceil(totalCount / state.itemsPerPage);
  const paginationItems = usePagination({
    currentPage: state.currentPage,
    totalPages,
    siblingCount: 1,
  });

  const metrics = useMemo(() => {
    const activeCount = departments.filter((dept: any) => dept.isActive).length;
    const withCoordinator = departments.filter(
      (dept: any) => dept.coordinators && dept.coordinators.length > 0,
    ).length;
    const totalStudents = departments.reduce(
      (sum: number, dept: any) => sum + (dept.studentCount || 0),
      0,
    );

    return [
      {
        label: "Total Departments",
        value: totalCount,
        hint: "Across all faculties",
        trend: "neutral" as const,
      },
      {
        label: "Active (Current View)",
        value: activeCount,
        hint: "Currently active departments",
        trend: "up" as const,
      },
      {
        label: "With Coordinators",
        value: withCoordinator,
        hint: "Departments with assignment",
        trend: "up" as const,
      },
      {
        label: "Students (Current View)",
        value: totalStudents,
        hint: "Students across listed departments",
        trend: "neutral" as const,
      },
    ];
  }, [departments, totalCount]);

  const handleToggleStatus = (dept: any) => {
    const action = dept.isActive ? "deactivate" : "activate";
    if (window.confirm(`Are you sure you want to ${action} ${dept.name}?`)) {
      mutations.toggleStatusMutation.mutate(dept.id);
    }
  };

  const handleHardDelete = (dept: any) => {
    if (
      window.confirm(`This will permanently delete ${dept.name}. Continue?`)
    ) {
      mutations.hardDeleteMutation.mutate(dept.id);
    }
  };

  const clearFilters = () => {
    setters.setSearchTerm("");
    setters.setSelectedFaculty("all");
    setters.setShowInactive(false);
    setters.setCurrentPage(1);
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Departments"
        description={`Manage departments across all faculties (${totalCount} total).`}
        actions={
          <CreateDepartment
            faculties={faculties}
            createMutation={mutations.createMutation}
          />
        }
      />

      <DashboardMetricsGrid items={metrics} />

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={state.searchTerm}
              onChange={(event) => {
                setters.setSearchTerm(event.target.value);
                setters.setCurrentPage(1);
              }}
              placeholder="Search by department name..."
              className="pl-9"
            />
          </div>

          <div className="md:col-span-1">
            <Select
              value={state.selectedFaculty}
              onValueChange={(value) => {
                setters.setSelectedFaculty(value);
                setters.setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {faculties.map((faculty: any) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 md:col-span-1 md:justify-end">
            <div className="flex items-center gap-2">
              <Switch
                id="showInactive"
                checked={state.showInactive}
                onCheckedChange={(checked) => {
                  setters.setShowInactive(checked);
                  setters.setCurrentPage(1);
                }}
              />
              <Label htmlFor="showInactive" className="text-sm text-muted-foreground">
                Show inactive
              </Label>
            </div>
            {(state.searchTerm ||
              state.selectedFaculty !== "all" ||
              state.showInactive) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {queries.departmentsQuery.isLoading ? (
        <LoadingPage label="Loading departments..." />
      ) : (
        <DepartmentsTable
          departments={departments}
          onAssign={setSelectedDeptForAssign}
          onToggleStatus={handleToggleStatus}
          onHardDelete={handleHardDelete}
          isAssigning={mutations.assignCoordinatorMutation.isPending}
          isDeleting={mutations.hardDeleteMutation.isPending}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {paginationItems.map((item, index) => (
                <PaginationItem key={index}>
                  {item.type === "previous" && (
                    <PaginationPrevious
                      onClick={() => setters.setCurrentPage(state.currentPage - 1)}
                      className={
                        item.disabled
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  )}
                  {item.type === "next" && (
                    <PaginationNext
                      onClick={() => setters.setCurrentPage(state.currentPage + 1)}
                      className={
                        item.disabled
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  )}
                  {item.type === "ellipsis" && <PaginationEllipsis />}
                  {item.type === "page" && (
                    <PaginationLink
                      onClick={() => setters.setCurrentPage(item.page!)}
                      isActive={item.isActive}
                      className="cursor-pointer"
                    >
                      {item.page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AssignCoordinator
        department={selectedDeptForAssign}
        onClose={() => setSelectedDeptForAssign(null)}
        assignMutation={mutations.assignCoordinatorMutation}
      />
    </div>
  );
}
