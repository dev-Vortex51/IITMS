"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, BarChart3, AlertCircle } from "lucide-react";
import { AttendanceCheckIn } from "@/components/attendance/attendance-check-in";
import { AttendanceHistory } from "@/components/attendance/attendance-history";
import { AbsenceRequestForm } from "@/components/attendance/absence-request-form";
import { useAuth } from "@/components/providers/auth-provider";
import { SectionCard, PageHeader, LoadingPage } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studentService } from "@/services/student.service";

const AttendanceSummaryCard = dynamic(
  () =>
    import("@/components/attendance/attendance-summary").then(
      (mod) => mod.AttendanceSummaryCard,
    ),
  { ssr: false },
);

export default function StudentAttendancePage() {
  useEffect(() => {
    document.title = "Attendance | ITMS";
  }, []);

  const { user } = useAuth();
  const studentId = user?.profileData?.id;

  const {
    data: placement,
    isLoading: isPlacementLoading,
  } = useQuery({
    queryKey: ["placement", studentId],
    queryFn: () => studentService.getStudentPlacement(studentId!),
    enabled: !!studentId,
    retry: false,
  });

  if (isPlacementLoading) {
    return <LoadingPage label="Loading attendance..." />;
  }

  const hasApprovedPlacement = placement?.status === "approved";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Manage your daily check-in/out and view attendance records"
      />

      <SectionCard title="Attendance Workspace" description="Check-in, history, absence, and summary">
        <Tabs defaultValue="check-in" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="check-in" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Check-in/Out</span>
              <span className="sm:hidden">Check</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="absence" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Absence</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Summary</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="check-in" className="space-y-6">
            {hasApprovedPlacement ? (
              <AttendanceCheckIn />
            ) : (
              <SectionCard
                title="Check-in Locked"
                description="Attendance check-in becomes available when your placement is approved."
              >
                <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    You need an approved placement before you can check in.
                  </p>
                </div>
                <Button asChild className="mt-4 h-9">
                  <Link href="/student/placement">Go to Placement</Link>
                </Button>
              </SectionCard>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <AttendanceHistory />
          </TabsContent>

          <TabsContent value="absence" className="space-y-6">
            <AbsenceRequestForm />
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            {studentId ? <AttendanceSummaryCard studentId={studentId} /> : null}
          </TabsContent>
        </Tabs>
      </SectionCard>
    </div>
  );
}
