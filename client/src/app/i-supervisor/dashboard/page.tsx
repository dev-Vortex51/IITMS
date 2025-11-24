"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import adminService from "@/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardCheck, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IndustrialSupervisorDashboardPage() {
  const { user } = useAuth();

  // Fetch assigned students
  const { data: studentsData } = useQuery({
    queryKey: ["supervisor-students", user?._id],
    queryFn: async () => {
      const response = await adminService.supervisorService.getAssignedStudents(
        user?._id || ""
      );
      return response.data;
    },
    enabled: !!user,
  });

  const students = studentsData || [];

  // Calculate statistics
  const totalLogbooks = students.reduce((sum: number, student: any) => {
    return sum + (student.logbookEntries?.length || 0);
  }, 0);

  const pendingLogbooks = students.reduce((sum: number, student: any) => {
    const pending =
      student.logbookEntries?.filter((l: any) => !l.supervisor_approval)
        .length || 0;
    return sum + pending;
  }, 0);

  const assessmentsCompleted = students.filter(
    (s: any) => s.assessmentCompleted
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Industrial Supervisor Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor and assess your assigned students at the workplace
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {students.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Under your supervision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Logbooks
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalLogbooks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Logbook entries submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
            <BookOpen className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingLogbooks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assessments Done
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {assessmentsCompleted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {students.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {pendingLogbooks > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div>
                <p className="font-medium text-yellow-900">
                  {pendingLogbooks} logbook entr
                  {pendingLogbooks > 1 ? "ies" : "y"} pending review
                </p>
                <p className="text-sm text-muted-foreground">
                  Review and approve student logbooks
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/i-supervisor/logbooks">Review Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Students */}
      <Card>
        <CardHeader>
          <CardTitle>My Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="space-y-3">
              {students.map((student: any) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.matricNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {student.department || "Department"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.logbookEntries?.length || 0} logbook entries
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No students assigned yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
