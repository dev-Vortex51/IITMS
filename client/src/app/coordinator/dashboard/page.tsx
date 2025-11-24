"use client";

import { useQuery } from "@tanstack/react-query";
import {
  studentService,
  placementService,
  logbookService,
} from "@/services/student.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  BookOpen,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CoordinatorDashboardPage() {
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

  // Fetch all logbook entries
  const { data: logbooksData } = useQuery({
    queryKey: ["logbooks"],
    queryFn: () => logbookService.getAllLogbooks({}),
  });

  const students = studentsData?.data || [];
  const placements = placementsData?.data || [];
  const logbooks = logbooksData?.data || [];

  const stats = {
    totalStudents: students.length,
    pendingPlacements: placements.filter((p: any) => p.status === "pending")
      .length,
    approvedPlacements: placements.filter((p: any) => p.status === "approved")
      .length,
    pendingLogbooks: logbooks.filter((l: any) => !l.supervisor_approval).length,
    studentsWithoutSupervisors: placements.filter(
      (p: any) => !p.departmentalSupervisor || !p.industrialSupervisor
    ).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Coordinator Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage SIWES students, placements, and supervisors
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingPlacements}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Placements awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Placements
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvedPlacements}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active placements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Logbooks
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.pendingLogbooks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entries to review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Required Section */}
      {(stats.pendingPlacements > 0 ||
        stats.studentsWithoutSupervisors > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Action Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingPlacements > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-yellow-900">
                    {stats.pendingPlacements} placement
                    {stats.pendingPlacements > 1 ? "s" : ""} pending approval
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Review and approve student placements
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href="/coordinator/placements">
                    Review
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
            {stats.studentsWithoutSupervisors > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-yellow-900">
                    {stats.studentsWithoutSupervisors} student
                    {stats.studentsWithoutSupervisors > 1 ? "s" : ""} need
                    supervisor assignment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Assign departmental and industrial supervisors
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href="/coordinator/placements">
                    Assign
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/coordinator/students">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Manage Students</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      View and manage all students
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/coordinator/placements">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Briefcase className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Review Placements
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Approve placement submissions
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/coordinator/supervisors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Assign Supervisors
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage supervisor assignments
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/coordinator/logbooks">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <BookOpen className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Review Logbooks</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Monitor student progress
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>

      {/* Recent Placements */}
      {placements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Placement Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {placements.slice(0, 5).map((placement: any) => {
                const statusConfig = {
                  pending: {
                    color: "text-yellow-600",
                    bg: "bg-yellow-50",
                    text: "Pending",
                  },
                  approved: {
                    color: "text-green-600",
                    bg: "bg-green-50",
                    text: "Approved",
                  },
                  rejected: {
                    color: "text-red-600",
                    bg: "bg-red-50",
                    text: "Rejected",
                  },
                };
                const config =
                  statusConfig[placement.status as keyof typeof statusConfig];

                return (
                  <div
                    key={placement._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{placement.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof placement.student === "object"
                          ? placement.student.name
                          : "Student"}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${config.bg}`}>
                      <span className={`text-sm font-medium ${config.color}`}>
                        {config.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
