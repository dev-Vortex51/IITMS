"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Briefcase,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { AttendanceCheckIn } from "@/components/attendance/attendance-check-in";
import {
  DashboardMetricsGrid,
  DashboardWelcomeBanner,
  ErrorLocalState,
  LoadingPage,
  SectionCard,
  StatusBadge,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { studentService } from "@/services/student.service";
import { logbookService } from "@/services/logbook.service";
import { InlineQuickActions } from "./components/InlineQuickActions";

const formatPlacementStatus = (status?: string) => {
  if (!status) return "Not Submitted";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function StudentDashboardPage() {
  useEffect(() => {
    document.title = "Student Dashboard | ITMS";
  }, []);

  const { user } = useAuth();
  const studentProfileId = user?.profileData?.id;

  const {
    data: student,
    isLoading: isStudentLoading,
    isError: isStudentError,
    refetch: refetchStudent,
  } = useQuery({
    queryKey: ["student", studentProfileId],
    queryFn: () => studentService.getStudentById(studentProfileId!),
    enabled: !!studentProfileId,
  });

  const {
    data: placement,
    isLoading: isPlacementLoading,
    isError: isPlacementError,
    refetch: refetchPlacement,
  } = useQuery({
    queryKey: ["placement", studentProfileId],
    queryFn: () => studentService.getStudentPlacement(studentProfileId!),
    enabled: !!studentProfileId,
    retry: false,
  });

  const {
    data: logbooksData,
    isLoading: isLogbooksLoading,
    isError: isLogbooksError,
    refetch: refetchLogbooks,
  } = useQuery({
    queryKey: ["logbooks", studentProfileId],
    queryFn: async () => {
      const response = await logbookService.getLogbooks({ student: studentProfileId });
      return response.data || [];
    },
    enabled: !!studentProfileId,
  });

  if (isStudentLoading || isPlacementLoading || isLogbooksLoading) {
    return <LoadingPage label="Loading dashboard..." />;
  }

  if (isStudentError || isPlacementError || isLogbooksError) {
    return (
      <div className="space-y-4 md:space-y-5">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <ErrorLocalState
          message="Some dashboard data could not be loaded."
          onRetry={() => {
            refetchStudent();
            refetchPlacement();
            refetchLogbooks();
          }}
        />
      </div>
    );
  }

  const logbooks = logbooksData || [];
  const submittedLogbooks = logbooks.filter((log: any) => log.status !== "draft").length;
  const supervisorsAssigned =
    student?.departmentalSupervisor && student?.industrialSupervisor
      ? 2
      : student?.departmentalSupervisor || student?.industrialSupervisor
      ? 1
      : 0;

  const metrics = [
    {
      label: "Placement",
      value: formatPlacementStatus(placement?.status),
      hint: placement ? "Current placement status" : "Submit placement details",
      trend: "up" as const,
    },
    {
      label: "Logbook Entries",
      value: submittedLogbooks,
      hint: "Submitted activity records",
      trend: "up" as const,
    },
    {
      label: "Supervisors Assigned",
      value: `${supervisorsAssigned}/2`,
      hint: "Departmental and industrial",
      trend: "neutral" as const,
    },
    {
      label: "Attendance",
      value: placement?.status === "approved" ? "Active" : "Locked",
      hint: "Enabled after placement approval",
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      <DashboardWelcomeBanner
        title="Student Workspace"
        description="Track placement progress, check in daily, and keep your training records current."
        action={
          <Button asChild className="h-9">
            <Link href="/student/logbook">Open Logbook</Link>
          </Button>
        }
      />

      <DashboardMetricsGrid items={metrics} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {placement?.status === "approved" ? (
            <AttendanceCheckIn />
          ) : (
            <SectionCard
              title="Check-in Locked"
              description="Attendance check-in becomes available when your placement is approved."
            >
              <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  You can still prepare your logbook and placement information while waiting for approval.
                </p>
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Placement Summary"
            description="Key information about your current placement record"
            actions={<StatusBadge status={placement?.status || "pending"} />}
          >
            {placement ? (
              <div className="space-y-3 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="mt-1 font-semibold text-foreground">{placement.companyName}</p>
                  </div>
                  <div className="rounded-md border border-border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {placement.position || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Training Period</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {new Date(placement.startDate).toLocaleDateString()} -{" "}
                    {new Date(placement.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Button asChild variant="outline" className="h-9">
                  <Link href="/student/placement">View Full Placement</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You have not submitted a placement yet.
                </p>
                <Button asChild>
                  <Link href="/student/placement">Register Placement</Link>
                </Button>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Logbook Progress"
            description="Submission status for your weekly training records"
            actions={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total Entries</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{logbooks.length}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{submittedLogbooks}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Drafts</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {Math.max(logbooks.length - submittedLogbooks, 0)}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-4 lg:sticky lg:top-24">
            <InlineQuickActions
              placementApproved={placement?.status === "approved"}
              onAttendanceRefresh={() => {
                void refetchStudent();
                void refetchPlacement();
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
