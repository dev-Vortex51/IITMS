"use client";

import { useQuery } from "@tanstack/react-query";
import { SupervisorApprovalInterface } from "@/components/attendance/supervisor-approval";
import { placementService } from "@/services/placement.service";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Users } from "lucide-react";

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
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Attendance Review
        </h1>
        <p className="text-muted-foreground">
          Review and approve student attendance records
        </p>
      </div>

      {/* Stats */}
      {placements && placements.length > 0 && (
        <Card>
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
        </Card>
      )}

      {/* Attendance review for each placement */}
      {placements && placements.length > 0 ? (
        <div className="space-y-6">
          {placements.map((placement: any) => (
            <div key={placement._id}>
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
              <SupervisorApprovalInterface placementId={placement._id} />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No students assigned yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
