"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { SupervisorApprovalInterface } from "@/components/attendance/supervisor-approval";
import { useAuth } from "@/components/providers/auth-provider";
import {
  EmptyState,
  ErrorGlobalState,
  LoadingPage,
  PageHeader,
  SectionCard,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { placementService } from "@/services/placement.service";

export default function IndustrialSupervisorAttendancePage() {
  const { user } = useAuth();
  const supervisorId = user?.profileData?.id;

  const placementsQuery = useQuery({
    queryKey: ["placements", "supervisor", supervisorId],
    queryFn: async () => {
      const placements = await placementService.getMyPlacements();
      const mine = (placements || []).filter(
        (placement: any) => placement.industrialSupervisor?.id === supervisorId,
      );

      const byStudent = new Map<string, any>();
      for (const placement of mine) {
        const studentId = placement.student?.id || placement.student;
        if (studentId && !byStudent.has(studentId)) {
          byStudent.set(studentId, placement);
        }
      }

      return Array.from(byStudent.values());
    },
    enabled: !!supervisorId,
  });

  const placements = useMemo(() => placementsQuery.data || [], [placementsQuery.data]);

  const activePlacement = useMemo(() => {
    if (!placements.length) return null;
    return placements[0];
  }, [placements]);

  if (placementsQuery.isLoading) {
    return <LoadingPage label="Loading attendance..." />;
  }

  if (placementsQuery.isError) {
    return (
      <ErrorGlobalState
        title="Unable to load attendance"
        message={(placementsQuery.error as Error)?.message || "Please try again."}
        onRetry={() => void placementsQuery.refetch()}
      />
    );
  }

  if (placements.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Attendance Review"
          description="Review and resolve attendance submissions from assigned students"
        />
        <SectionCard title="No Students Assigned">
          <EmptyState
            title="No placements assigned"
            description="If you believe this is a mistake, contact your coordinator."
            icon={<FileText className="h-10 w-10 text-muted-foreground/60" />}
          />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance Review"
        description="Approve, reject, or reclassify attendance records for your students"
      />

      {activePlacement ? (
        <SectionCard title="Active Review">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-muted/20 p-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {activePlacement.student?.user?.firstName} {activePlacement.student?.user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{activePlacement.student?.matricNumber || "N/A"}</p>
            </div>
            <Badge variant="outline">{activePlacement.companyName || "No company"}</Badge>
          </div>

          <SupervisorApprovalInterface placementId={activePlacement.id} />
        </SectionCard>
      ) : null}
    </div>
  );
}
