"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { ArrowLeft, AlertCircle } from "lucide-react";

import { useSupervisorAssignment } from "./_hooks/useSupervisorAssignment";
import { CurrentSupervisors } from "./_components/CurrentSupervisors";
import { SupervisorAssignmentForm } from "./_components/SupervisorAssignmentForm";
import { SupervisorPlacementInfo } from "./_components/SupervisorPlacementInfo";

export default function StudentSupervisorsPage({
  params,
}: {
  params: { id: string };
}) {
  const assignmentData = useSupervisorAssignment(params.id);
  const { student, placement, isLoading } = assignmentData;

  if (isLoading) {
    return <LoadingPage label="Loading assignment details..." />;
  }

  // Guard Clause: No placement means no supervisors can be assigned
  if (!placement) {
    return (
      <div className="space-y-4 md:space-y-5 max-w-5xl">
        <PageHeader
          title="Supervisor Assignment"
          description="Assign and review departmental and industrial supervisors."
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href={`/coordinator/students/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          }
        />
        <Card className="border-dashed border-2">
          <CardContent className="pt-8 pb-8">
            <EmptyState
              title="No Placement Found"
              description="Student must have an approved placement before supervisors can be assigned."
              icon={<AlertCircle className="h-8 w-8 text-yellow-600" />}
              actionLabel="View Placement Status"
              onAction={() => {
                window.location.href = `/coordinator/students/${params.id}/placement`;
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 max-w-5xl">
      <PageHeader
        title="Supervisor Assignment"
        description="Assign and review departmental and industrial supervisors."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/coordinator/students/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
        }
      />

      <SupervisorPlacementInfo placement={placement} />
      <CurrentSupervisors student={student} />
      <SupervisorAssignmentForm {...assignmentData} studentId={params.id} />
    </div>
  );
}
