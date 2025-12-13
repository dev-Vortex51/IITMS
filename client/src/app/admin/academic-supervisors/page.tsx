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
import { Users, Mail, Phone, GraduationCap, Eye, Plus } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";

export default function AcademicSupervisorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all supervisors and filter academic ones
  const { data: supervisorsData, isLoading } = useQuery({
    queryKey: ["supervisors", "academic"],
    queryFn: async () => {
      const result = await adminService.supervisorService.getAllSupervisors();
      return result;
    },
  });

  const allSupervisors = supervisorsData?.data || [];

  // Filter for academic supervisors only
  const academicSupervisors = allSupervisors.filter(
    (supervisor: any) =>
      supervisor.type === "academic" || supervisor.type === "departmental"
  );

  // Pagination calculations
  const totalPages = Math.ceil(academicSupervisors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSupervisors = academicSupervisors.slice(startIndex, endIndex);

  const paginationItems = usePagination({
    currentPage,
    totalPages,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading academic supervisors...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Academic Supervisors
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage academic supervisors (up to 10 students cross-department)
          </p>
        </div>
        <Link href="/admin/invitations">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Academic Supervisor
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Academic Supervisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {academicSupervisors.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                academicSupervisors.filter(
                  (s: any) =>
                    (s.assignedStudents?.length || 0) < (s.maxStudents || 10)
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students Supervised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {academicSupervisors.reduce(
                (sum: number, s: any) =>
                  sum + (s.assignedStudents?.length || 0),
                0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supervisors List */}
      <Card>
        <CardHeader>
          <CardTitle>All Academic Supervisors</CardTitle>
          <CardDescription>
            Academic supervisors can supervise up to 10 students from different
            departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedSupervisors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Academic Supervisors
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first academic supervisor
              </p>
              <Link href="/admin/invitations">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Academic Supervisor
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedSupervisors.map((supervisor: any) => (
                <Card key={supervisor._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {supervisor.user?.firstName &&
                              supervisor.user?.lastName
                                ? `${supervisor.user.firstName} ${supervisor.user.lastName}`
                                : supervisor.name || "N/A"}
                            </h3>
                            {supervisor.specialization && (
                              <p className="text-sm text-muted-foreground">
                                {supervisor.specialization}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          {supervisor.user?.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{supervisor.user.email}</span>
                            </div>
                          )}
                          {supervisor.user?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{supervisor.user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {supervisor.assignedStudents?.length || 0} /{" "}
                              {supervisor.maxStudents || 10} students
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Badge
                            variant={
                              (supervisor.assignedStudents?.length || 0) <
                              (supervisor.maxStudents || 10)
                                ? "default"
                                : "secondary"
                            }
                          >
                            {(supervisor.assignedStudents?.length || 0) <
                            (supervisor.maxStudents || 10)
                              ? "Available"
                              : "Full Capacity"}
                          </Badge>
                          {supervisor.department && (
                            <Badge variant="outline">
                              {typeof supervisor.department === "object"
                                ? supervisor.department.name
                                : "Dept Assigned"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/admin/academic-supervisors/${supervisor._id}`}
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  {paginationItems.map((item, index) => {
                    if (item.type === "previous") {
                      return (
                        <PaginationItem key="previous">
                          <PaginationPrevious
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
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
                        <PaginationItem key="next">
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
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
                        <PaginationItem key={`ellipsis-${index}`}>
                          <span className="px-4">...</span>
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={item.page}>
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
    </div>
  );
}
