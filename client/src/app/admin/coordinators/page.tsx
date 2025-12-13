"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCog, Building, Mail, Users, Eye } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";

export default function CoordinatorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch all departments to find coordinators
  const { data: departmentsData, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => adminService.departmentService.getAllDepartments(),
  });

  // Fetch coordinator users data
  const { data: coordinatorsData, isLoading: coordinatorsLoading } = useQuery({
    queryKey: ["coordinators"],
    queryFn: () =>
      adminService.userService.getAllUsers({ role: "coordinator" }),
  });

  const departments = departmentsData?.data || [];
  const coordinators = coordinatorsData?.data?.users || [];

  // Helper function to get coordinator info by ID
  const getCoordinatorInfo = (coordinatorId: string) => {
    return coordinators.find((coord: any) => coord._id === coordinatorId);
  };

  // Filter departments that have coordinators
  const departmentsWithCoordinators = departments.filter(
    (dept: any) => dept.coordinators && dept.coordinators.length > 0
  );

  // Pagination calculations
  const totalPages = Math.ceil(
    departmentsWithCoordinators.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDepartments = departmentsWithCoordinators.slice(
    startIndex,
    endIndex
  );

  console.log("Coordinators pagination:", {
    total: departmentsWithCoordinators.length,
    totalPages,
    currentPage,
    itemsPerPage,
  });

  // Pagination hook
  const paginationItems = usePagination({
    currentPage,
    totalPages,
  });

  return (
    <div className="space-y-4 sm:space-y-6 ">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
            Coordinators
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage department coordinators and their assignments
          </p>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/invitations">
            <UserCog className="h-4 w-4 mr-2" />
            Invite Coordinator
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Coordinators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span className="text-xl sm:text-2xl font-bold text-primary">
                {departmentsWithCoordinators.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Building className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              <span className="text-xl sm:text-2xl font-bold">
                {departments.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Unassigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Building className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 shrink-0" />
              <span className="text-xl sm:text-2xl font-bold text-yellow-600">
                {departments.length - departmentsWithCoordinators.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Departments without coordinators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coordinators List */}
      {isLoading || coordinatorsLoading ? (
        <div className="text-center py-8 text-sm sm:text-base">
          Loading coordinators...
        </div>
      ) : departmentsWithCoordinators.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Assigned Coordinators
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Coordinators and their departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {paginatedDepartments.map((dept: any) => (
                <div
                  key={dept._id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/5 transition-colors gap-3 lg:gap-4"
                >
                  <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                      <UserCog className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {dept.coordinators.map(
                        (coordinatorId: string, index: number) => {
                          const coordinator = getCoordinatorInfo(coordinatorId);
                          return (
                            <div
                              key={coordinatorId}
                              className={
                                index > 0
                                  ? "mt-2 sm:mt-3 pt-2 sm:pt-3 border-t"
                                  : ""
                              }
                            >
                              <p className="font-medium text-sm sm:text-base truncate">
                                {coordinator
                                  ? `${coordinator.firstName} ${coordinator.lastName}`
                                  : "Coordinator"}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                <Building className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {dept.name}
                                </span>
                                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                                  •
                                </span>
                                <span className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {typeof dept.faculty === "object"
                                    ? dept.faculty.name
                                    : "Faculty"}
                                </span>
                              </div>
                              {coordinator?.email && (
                                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                  <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="text-xs sm:text-sm text-muted-foreground truncate break-all">
                                    {coordinator.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full lg:w-auto">
                    <Badge variant="secondary" className="text-xs">
                      <UserCog className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">
                        {dept.coordinators.length} coordinator
                        {dept.coordinators.length !== 1 ? "s" : ""}
                      </span>
                    </Badge>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Link href={`/admin/departments/${dept._id}`}>
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {paginationItems.map((item, index) => {
                      if (item.type === "previous") {
                        return (
                          <PaginationItem key={index}>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(currentPage - 1)}
                              className={
                                item.disabled
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        );
                      }

                      if (item.type === "next") {
                        return (
                          <PaginationItem key={index}>
                            <PaginationNext
                              onClick={() => setCurrentPage(currentPage + 1)}
                              className={
                                item.disabled
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        );
                      }

                      if (item.type === "ellipsis") {
                        return (
                          <PaginationItem key={index}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={index}>
                          <PaginationLink
                            onClick={() => setCurrentPage(item.page!)}
                            isActive={item.isActive}
                            className="cursor-pointer"
                          >
                            {item.page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <UserCog className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg">
                  No Coordinators Assigned
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Assign coordinators to departments to get started
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unassigned Departments */}
      {departments.length - departmentsWithCoordinators.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Departments Without Coordinators
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              These departments need coordinator assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {departments
                .filter(
                  (dept: any) =>
                    !dept.coordinators || dept.coordinators.length === 0
                )
                .map((dept: any) => (
                  <div
                    key={dept._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-yellow-200 rounded-lg bg-yellow-50 gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-100 shrink-0">
                        <Building className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base text-yellow-900 truncate">
                          {dept.name}
                        </p>
                        <p className="text-xs sm:text-sm text-yellow-700 truncate">
                          {typeof dept.faculty === "object"
                            ? dept.faculty.name
                            : "Faculty"}{" "}
                          • Code: {dept.code}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Link href={`/admin/departments/${dept._id}`}>
                        <span className="hidden sm:inline">
                          Assign Coordinator
                        </span>
                        <span className="sm:hidden">Assign</span>
                      </Link>
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
