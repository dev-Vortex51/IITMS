"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export const metadata = {
  title: "Admin Dashboard",
};
import adminService from "@/services/admin.service";
import { studentService, placementService } from "@/services/student.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  School,
  Building,
  Users,
  UserCog,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboardPage() {
  useEffect(() => {
    document.title = "Admin Dashboard | ITMS";
  }, []);

  // Fetch system data
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
    queryFn: () => studentService.getStudents(),
  });

  const { data: placementsData } = useQuery({
    queryKey: ["placements"],
    queryFn: () => placementService.getAllPlacements({}),
  });

  console.log(studentsData);

  const faculties = facultiesData?.data || [];
  const departments = departmentsData?.data || [];
  const students = studentsData?.data || [];
  const placements = placementsData?.data || [];

  const stats = {
    totalFaculties: faculties.length,
    totalDepartments: departments.length,
    totalStudents: students.length,
    activePlacements: placements.filter((p: any) => p.status === "approved")
      .length,
  };

  // Prepare chart data
  const departmentChartData = departments.slice(0, 6).map((dept: any) => ({
    name:
      dept.name.length > 15 ? dept.name.substring(0, 15) + "..." : dept.name,
    students: dept.studentCount || 0,
  }));

  const placementChartData = [
    {
      name: "Approved",
      value: placements.filter((p: any) => p.status === "approved").length,
      color: "#22c55e",
    },
    {
      name: "Pending",
      value: placements.filter((p: any) => p.status === "pending").length,
      color: "#eab308",
    },
    {
      name: "Rejected",
      value: placements.filter((p: any) => p.status === "rejected").length,
      color: "#ef4444",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System overview and management
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faculties
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalFaculties}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered faculties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalDepartments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total registered students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Placements
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activePlacements}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Approved placements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <School className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Create Faculty</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add new faculty
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/faculties">
                  <Plus className="h-4 w-4 mr-2" />
                  New Faculty
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Building className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Create Department
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add new department
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/departments">
                  <Plus className="h-4 w-4 mr-2" />
                  New Department
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserCog className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Manage Coordinators
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Assign coordinators
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/coordinators">View All</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Students Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="students"
                    fill="hsl(var(--primary))"
                    name="Students"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placement Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Placement Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {placements.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={placementChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {placementChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No placement data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Faculties</CardTitle>
          </CardHeader>
          <CardContent>
            {faculties.length > 0 ? (
              <div className="space-y-3">
                {faculties.slice(0, 5).map((faculty: any) => (
                  <div
                    key={faculty._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{faculty.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Code: {faculty.code}
                      </p>
                    </div>
                    <School className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No faculties yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {departments.length > 0 ? (
              <div className="space-y-3">
                {departments.slice(0, 5).map((dept: any) => (
                  <div
                    key={dept._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof dept.faculty === "object"
                          ? dept.faculty.name
                          : "Faculty"}
                      </p>
                    </div>
                    <Building className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No departments yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
