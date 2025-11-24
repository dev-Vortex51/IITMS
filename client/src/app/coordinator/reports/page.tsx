"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Users,
  Building,
  Briefcase,
  UserCheck,
  Download,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";

export default function CoordinatorReportsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  // Fetch departments
  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => adminService.departmentService.getAllDepartments(),
  });

  // Fetch all students
  const { data: studentsData } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getAllStudents(),
  });

  // Fetch all placements
  const { data: placementsData } = useQuery({
    queryKey: ["placements"],
    queryFn: () => placementService.getAllPlacements({}),
  });

  // Fetch supervisors
  const { data: dSupervisorsData } = useQuery({
    queryKey: ["departmental-supervisors"],
    queryFn: () =>
      adminService.supervisorService.getAllSupervisors({
        type: "departmental",
      }),
  });

  const { data: iSupervisorsData } = useQuery({
    queryKey: ["industrial-supervisors"],
    queryFn: () =>
      adminService.supervisorService.getAllSupervisors({ type: "industrial" }),
  });

  const departments = departmentsData?.data || [];
  const students = studentsData?.data || [];
  const placements = placementsData?.data || [];
  const departmentalSupervisors = dSupervisorsData?.data || [];
  const industrialSupervisors = iSupervisorsData?.data || [];

  // Calculate statistics
  const totalStudents = students.length;
  const approvedPlacements = placements.filter(
    (p: any) => p.status === "approved"
  ).length;
  const pendingPlacements = placements.filter(
    (p: any) => p.status === "pending"
  ).length;
  const rejectedPlacements = placements.filter(
    (p: any) => p.status === "rejected"
  ).length;

  // Department breakdown
  const departmentStats = departments.map((dept: any) => {
    const deptStudents = students.filter((s: any) => {
      const studentDept =
        typeof s.department === "object" ? s.department._id : s.department;
      return studentDept === dept._id;
    });

    return {
      name: dept.name,
      students: deptStudents.length,
      withPlacement: deptStudents.filter((s: any) => s.placement).length,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            View comprehensive reports and system statistics
          </p>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-4">
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
                {totalStudents}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Placements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedPlacements}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departmental Supervisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {departmentalSupervisors.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Industrial Supervisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {industrialSupervisors.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placement Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Placement Statistics</CardTitle>
              <CardDescription>
                Overview of student placement status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg bg-green-50">
              <p className="text-sm text-muted-foreground mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {approvedPlacements}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalStudents > 0
                  ? Math.round((approvedPlacements / totalStudents) * 100)
                  : 0}
                % of total students
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-yellow-50">
              <p className="text-sm text-muted-foreground mb-1">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {pendingPlacements}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalStudents > 0
                  ? Math.round((pendingPlacements / totalStudents) * 100)
                  : 0}
                % of total students
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-red-50">
              <p className="text-sm text-muted-foreground mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {rejectedPlacements}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalStudents > 0
                  ? Math.round((rejectedPlacements / totalStudents) * 100)
                  : 0}
                % of total students
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>
            Select department to view specific reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept: any) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <FileDown className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>
                Download reports in various formats
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" disabled className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Student List (PDF)
            </Button>
            <Button variant="outline" disabled className="justify-start">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Student List (Excel)
            </Button>
            <Button variant="outline" disabled className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Placement Report (PDF)
            </Button>
            <Button variant="outline" disabled className="justify-start">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Placement Report (Excel)
            </Button>
            <Button variant="outline" disabled className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Supervisor List (PDF)
            </Button>
            <Button variant="outline" disabled className="justify-start">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Analytics Summary (Excel)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Note: Export functionality coming soon
          </p>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Department Breakdown</CardTitle>
              <CardDescription>
                Student distribution across departments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.map((dept: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{dept.name}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {dept.students} students
                    </span>
                    <span className="text-green-600">
                      {dept.withPlacement} with placement
                    </span>
                  </div>
                </div>
                {index < departmentStats.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
            {departmentStats.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No department data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
