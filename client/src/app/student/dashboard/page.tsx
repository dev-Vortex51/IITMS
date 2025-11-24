"use client";

import { useQuery } from "@tanstack/react-query";
import { studentService, placementService } from "@/services/student.service";
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  // Fetch student data
  const { data: students } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getAllStudents(),
    enabled: !!user,
  });

  const student = students?.data?.[0];

  // Fetch placement data
  const { data: placementData } = useQuery({
    queryKey: ["placement", student?._id],
    queryFn: () => studentService.getStudentPlacement(student._id),
    enabled: !!student,
  });

  const placement = placementData;

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
            <div className="text-2xl font-bold">0</div>
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
              {student?.departmental_supervisor &&
              student?.industrial_supervisor
                ? "2"
                : student?.departmental_supervisor ||
                  student?.industrial_supervisor
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
                  <div className="font-medium">Register Placement</div>
                  <div className="text-xs text-muted-foreground">
                    Submit your placement details
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
