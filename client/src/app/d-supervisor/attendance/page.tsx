"use client";

import { useQuery } from "@tanstack/react-query";
import { SupervisorApprovalInterface } from "@/components/attendance/supervisor-approval";
import { placementService } from "@/services/placement.service";
import { useAuth } from "@/components/providers/auth-provider";
import {
  EmptyState,
  LoadingPage,
  PageHeader,
  SectionCard,
} from "@/components/design-system";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AcademicSupervisorAttendancePage() {
  const { user } = useAuth();

  // Get placements assigned to this supervisor
  const { data: placements, isLoading } = useQuery({
    queryKey: ["placements", "supervisor"],
    queryFn: async () => {
      // Fetch placements where this supervisor is assigned
      return placementService.getMyPlacements();
    },
  });

  if (isLoading) {
    return <LoadingPage label="Loading attendance..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Review"
        description="Review and approve student attendance records"
      />

      {/* Stats */}
      {placements && placements.length > 0 && (
        <SectionCard title="Your Students">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Students
            </CardTitle>
            <CardDescription>
              You are supervising {placements.length} student
              {placements.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Review their attendance records and approve/reject as needed
            </div>
          </CardContent>
        </SectionCard>
      )}

      {/* Attendance review for each placement */}
      {placements && placements.length > 0 ? (
        <div className="space-y-6">
          {placements.map((placement: any) => (
            <div key={placement.id}>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {placement.student?.user?.firstName}{" "}
                    {placement.student?.user?.lastName}
                  </CardTitle>
                  <CardDescription>
                    {placement.student?.matricNumber} • {placement.companyName}
                  </CardDescription>
                </CardHeader>
              </Card>
              <SupervisorApprovalInterface placementId={placement.id} />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <EmptyState
              title="No Students Assigned"
              description="Students will appear here once assigned to you."
              icon={<Users className="h-12 w-12 text-muted-foreground/50" />}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
