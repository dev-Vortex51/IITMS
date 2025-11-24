"use client";

import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
import { studentService, placementService } from "@/services/student.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  FileBarChart,
  Users,
  Building,
  School,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";

export default function AdminReportsPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [facultyPage, setFacultyPage] = useState(1);
  const facultyItemsPerPage = 5;

  // Fetch all data for reports
  const { data: facultiesData } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => adminService.facultyService.getAllFaculties(),
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => adminService.departmentService.getAllDepartments(),
  });

  const { data: studentsData } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getAllStudents(),
  });

  console.log(studentsData);

  const { data: placementsData } = useQuery({
    queryKey: ["placements"],
    queryFn: () => placementService.getAllPlacements({}),
  });

  const faculties = facultiesData?.data || [];
  const departments = departmentsData?.data || [];
  const students = studentsData?.data || [];
  const placements = placementsData?.data || [];

  // Pagination for faculty breakdown
  const facultyTotalPages = Math.ceil(faculties.length / facultyItemsPerPage);
  const facultyPaginationItems = usePagination({
    currentPage: facultyPage,
    totalPages: facultyTotalPages,
  });

  // Filter departments based on selected faculty
  const filteredDepartments =
    selectedFaculty === "all"
      ? departments
      : departments.filter(
          (dept: any) =>
            (typeof dept.faculty === "object"
              ? dept.faculty._id
              : dept.faculty) === selectedFaculty
        );

  // Calculate statistics
  const stats = {
    totalFaculties: faculties.length,
    totalDepartments: departments.length,
    totalStudents: students.length,
    totalPlacements: placements.length,
    approvedPlacements: placements.filter((p: any) => p.status === "approved")
      .length,
    pendingPlacements: placements.filter((p: any) => p.status === "pending")
      .length,
    rejectedPlacements: placements.filter((p: any) => p.status === "rejected")
      .length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate and export system-wide reports
        </p>
      </div>

      {/* System Overview Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Faculties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {stats.totalFaculties}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {stats.totalDepartments}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {stats.totalStudents}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Placements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {stats.approvedPlacements}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Placement Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Placement Statistics</CardTitle>
          <CardDescription>Overview of student placements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.approvedPlacements}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pendingPlacements}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.rejectedPlacements}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>
            Select faculty and department to filter reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select
                value={selectedFaculty}
                onValueChange={setSelectedFaculty}
              >
                <SelectTrigger id="faculty">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {faculties.map((faculty: any) => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {filteredDepartments.map((dept: any) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Download reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <FileBarChart className="h-4 w-4" />
                System Reports
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled
                >
                  <span>Faculty Report (PDF)</span>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled
                >
                  <span>Department Report (PDF)</span>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled
                >
                  <span>Student Report (Excel)</span>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Placement Reports
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled
                >
                  <span>Placement Summary (PDF)</span>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled
                >
                  <span>Supervisor Report (PDF)</span>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled
                >
                  <span>Assessment Report (Excel)</span>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Export functionality coming soon
          </p>
        </CardContent>
      </Card>

      {/* Faculty Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Breakdown</CardTitle>
          <CardDescription>Students and placements per faculty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {faculties
              .slice(
                (facultyPage - 1) * facultyItemsPerPage,
                facultyPage * facultyItemsPerPage
              )
              .map((faculty: any) => {
                const facultyDepartments = departments.filter(
                  (dept: any) =>
                    (typeof dept.faculty === "object"
                      ? dept.faculty._id
                      : dept.faculty) === faculty._id
                );
                // Use department aggregation field `studentCount` added by backend.
                // The previous code tried to read an array `dept.students` which isn't
                // sent to this page (only counts), causing 0 totals.
                const facultyStudentCount = facultyDepartments.reduce(
                  (sum: number, dept: any) => sum + (dept.studentCount || 0),
                  0
                );

                return (
                  <div
                    key={faculty._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <School className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{faculty.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {facultyDepartments.length} departments
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {facultyStudentCount} students
                      </p>
                      <p className="text-sm text-muted-foreground">enrolled</p>
                    </div>
                  </div>
                );
              })}
          </div>

          {faculties.length > facultyItemsPerPage && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  {facultyPaginationItems.map((item, index) => {
                    if (item.type === "previous") {
                      return (
                        <PaginationItem key={index}>
                          <PaginationPrevious
                            onClick={() =>
                              setFacultyPage((prev) => Math.max(1, prev - 1))
                            }
                            className={
                              facultyPage === 1
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
                            onClick={() =>
                              setFacultyPage((prev) =>
                                Math.min(facultyTotalPages, prev + 1)
                              )
                            }
                            className={
                              facultyPage === facultyTotalPages
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
                          onClick={() => setFacultyPage(item.page as number)}
                          isActive={facultyPage === item.page}
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
