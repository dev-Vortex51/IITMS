"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardCheck, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DepartmentalSupervisorDashboardPage() {
  const { user } = useAuth();

  const supervisorId = user?.profileData?._id;

  // Fetch supervisor dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ["supervisor-dashboard", supervisorId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/supervisors/${supervisorId}/dashboard`
      );
      return response.data.data;
    },
    enabled: !!supervisorId,
  });

  // Calculate statistics from dashboard data
  const totalStudents = dashboardData?.statistics?.assignedStudents || 0;
  const totalPendingReviews = dashboardData?.statistics?.pendingLogbooks || 0;
  const maxCapacity = dashboardData?.statistics?.maxCapacity || 0;
  const totalLogbooks = dashboardData?.statistics?.totalLogbooks || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Departmental Supervisor Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor and assess your assigned students
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
              {totalStudents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Under your supervision
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
              {totalPendingReviews}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Logbooks awaiting review
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
              Assessments Done
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {totalStudents}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {totalPendingReviews > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div>
                <p className="font-medium text-yellow-900">
                  {totalPendingReviews} logbook entr
                  {totalPendingReviews > 1 ? "ies" : "y"} pending review
                </p>
                <p className="text-sm text-muted-foreground">
                  Review and approve student logbooks
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/d-supervisor/logbooks">Review Now</Link>
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
          {totalStudents > 0 ? (
            <div className="space-y-3">
              {dashboardData?.supervisor?.assignedStudents?.map(
                (student: any) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
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
                        {student.currentPlacement?.companyName ||
                          "No placement"}
                      </p>
                    </div>
                  </div>
                )
              )}
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
