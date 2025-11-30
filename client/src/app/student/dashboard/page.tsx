"use client";

import { useQuery } from "@tanstack/react-query";
import { studentService, placementService } from "@/services/student.service";
import { logbookService } from "@/services/logbook.service";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  Calendar,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  // Get student profile ID from authenticated user
  const studentProfileId = user?.studentProfile || user?.profileData?._id;

  // Fetch student data
  const { data: studentData } = useQuery({
    queryKey: ["student", studentProfileId],
    queryFn: () => studentService.getStudentById(studentProfileId!),
    enabled: !!studentProfileId,
  });

  const student = studentData;

  // Fetch placement data
  const { data: placementData } = useQuery({
    queryKey: ["placement", studentProfileId],
    queryFn: () => studentService.getStudentPlacement(studentProfileId!),
    enabled: !!studentProfileId,
    retry: false,
  });

  const placement = placementData;

  // Fetch logbook entries
  const { data: logbooksData } = useQuery({
    queryKey: ["logbooks", studentProfileId],
    queryFn: async () => {
      const response = await logbookService.getLogbooks({
        student: studentProfileId,
      });
      return response.data || [];
    },
    enabled: !!studentProfileId,
  });

  const logbooks = logbooksData || [];
  const submittedLogbooks = logbooks.filter(
    (log: any) => log.status !== "draft"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your industrial training progress.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Placement Status
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {placement ? (
                <span
                  className={
                    placement.status === "approved"
                      ? "text-green-600"
                      : placement.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {placement.status.charAt(0).toUpperCase() +
                    placement.status.slice(1)}
                </span>
              ) : (
                <span className="text-muted-foreground">Not Submitted</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {placement ? "Placement registered" : "Register your placement"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Logbook Entries
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedLogbooks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total entries submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supervisors</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student?.departmentalSupervisor && student?.industrialSupervisor
                ? "2"
                : student?.departmentalSupervisor ||
                  student?.industrialSupervisor
                ? "1"
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assigned supervisors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending evaluations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placement Details - Show when submitted */}
      {placement && (
        <Card
          className={
            placement.status === "approved"
              ? "border-green-200 bg-green-50/50"
              : placement.status === "pending"
              ? "border-yellow-200 bg-yellow-50/50"
              : "border-red-200 bg-red-50/50"
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Placement Details</CardTitle>
                <CardDescription>
                  Your industrial training placement information
                </CardDescription>
              </div>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  placement.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : placement.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {placement.status === "approved" ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Approved
                  </>
                ) : placement.status === "pending" ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Pending Review
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Rejected
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Company
                  </p>
                  <p className="font-semibold">{placement.companyName}</p>
                  {placement.companySector && (
                    <p className="text-sm text-muted-foreground">
                      {placement.companySector}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Duration
                  </p>
                  <p className="font-semibold">
                    {new Date(placement.startDate).toLocaleDateString()} -{" "}
                    {new Date(placement.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {placement.reviewComment && (
              <div className="mt-4 p-3 rounded-lg bg-background border">
                <p className="text-sm font-medium mb-1">Coordinator Remarks:</p>
                <p className="text-sm text-muted-foreground">
                  {placement.reviewComment}
                </p>
              </div>
            )}
            <div className="mt-4">
              <Link href="/student/placement">
                <Button variant="outline" className="w-full">
                  View Full Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might need</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/student/placement">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">
                    {placement ? "View Placement" : "Register Placement"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {placement
                      ? "Check placement status"
                      : "Submit your placement details"}
                  </div>
                </div>
              </div>
            </Button>
          </Link>

          <Link href="/student/logbook">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Fill Logbook</div>
                  <div className="text-xs text-muted-foreground">
                    Record your daily activities
                  </div>
                </div>
              </div>
            </Button>
          </Link>

          <Link href="/student/supervisors">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">View Supervisors</div>
                  <div className="text-xs text-muted-foreground">
                    Contact your supervisors
                  </div>
                </div>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {!placement && (
        <Card className="border-accent bg-accent/5">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <CardTitle>Action Required: Register Your Placement</CardTitle>
                <CardDescription className="mt-1">
                  You need to register your industrial training placement to
                  proceed. Upload your acceptance letter and provide company
                  details.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/student/placement">
              <Button>Register Placement Now</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
