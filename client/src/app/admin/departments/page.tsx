"use client";

import { useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import { useDepartmentsLogic } from "./_hooks/useDepartmentsLogic";
import DepartmentFilters from "./_components/DepartmentFilters";
import DepartmentCard from "./_components/DepartmentCard";
import CreateDepartment from "./_components/CreateDepartment";
import AssignCoordinator from "./_components/AssignCoordinator";
import { Building } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function DepartmentsPage() {
  const { state, setters, queries, mutations } = useDepartmentsLogic();
  const [selectedDeptForAssign, setSelectedDeptForAssign] = useState<any>(null);

  const departments = queries.departmentsQuery.data?.data || [];
  const faculties = queries.facultiesQuery.data?.data || [];
  const meta = queries.departmentsQuery.data?.meta || {};

  const totalCount = meta.totalItems || meta.totalCount || departments.length;
  const totalPages =
    meta.totalPages || Math.ceil(totalCount / state.itemsPerPage);
  const paginationItems = usePagination({
    currentPage: state.currentPage,
    totalPages,
    siblingCount: 1,
  });

  const handleToggleStatus = (dept: any) => {
    const action = dept.isActive ? "deactivate" : "activate";
    if (window.confirm(`Are you sure you want to ${action} ${dept.name}?`)) {
      mutations.toggleStatusMutation.mutate(dept.id);
    }
  };

  const handleHardDelete = (dept: any) => {
    if (
      window.confirm(`This will PERMANENTLY delete ${dept.name}!\n\nContinue?`)
    ) {
      mutations.hardDeleteMutation.mutate(dept.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
            Departments
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage departments across all faculties ({totalCount} total)
          </p>
        </div>
        <CreateDepartment
          faculties={faculties}
          createMutation={mutations.createMutation}
        />
      </div>

      <DepartmentFilters
        state={state}
        setters={setters}
        faculties={faculties}
      />

      {queries.departmentsQuery.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : departments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept: any) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onAssign={() => setSelectedDeptForAssign(dept)}
              onToggleStatus={handleToggleStatus}
              onHardDelete={handleHardDelete}
              isLoading={
                mutations.toggleStatusMutation.isPending ||
                mutations.hardDeleteMutation.isPending
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Building className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg">No Departments Found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {paginationItems.map((item, index) => (
                <PaginationItem key={index}>
                  {item.type === "previous" && (
                    <PaginationPrevious
                      onClick={() =>
                        setters.setCurrentPage(state.currentPage - 1)
                      }
                      className={
                        item.disabled
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  )}
                  {item.type === "next" && (
                    <PaginationNext
                      onClick={() =>
                        setters.setCurrentPage(state.currentPage + 1)
                      }
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
