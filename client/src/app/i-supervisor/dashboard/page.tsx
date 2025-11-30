"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IndustrialSupervisorDashboardPage() {
  const { user } = useAuth();

  const supervisorId = user?.profileData?._id;

  // Fetch supervisor dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["supervisor-dashboard", supervisorId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/supervisors/${supervisorId}/dashboard`
      );
      return response.data.data;
    },
    enabled: !!supervisorId,
  });

  const students = dashboardData?.supervisor?.assignedStudents || [];
  const stats = dashboardData?.statistics || {};
  const pendingLogbooks = stats.pendingLogbooks || 0;
  const totalLogbooks = stats.totalLogbooks || 0;

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
              Logbook Reviews
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalLogbooks - pendingLogbooks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reviewed logbooks
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
                  Review student logbooks
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
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading students...
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-3">
              {students.map((student: any) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {student.user?.firstName} {student.user?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {student.matricNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {typeof student.department === "object"
                        ? student.department.name
                        : "Department"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.currentPlacement?.companyName || "No placement"}
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
