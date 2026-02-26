"use client";

import Link from "next/link";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

import { useSupervisorAssignment } from "./_hooks/useSupervisorAssignment";
import { SupervisorHeader } from "./_components/SupervisorHeader";
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading size="lg" />
        <p className="text-muted-foreground mt-4">
          Loading assignment details...
        </p>
      </div>
    );
  }

  // Guard Clause: No placement means no supervisors can be assigned
  if (!placement) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/coordinator/students/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <Card className="border-dashed border-2">
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-semibold text-xl">No Placement Found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
              Student must have an approved placement before supervisors can be
              assigned.
            </p>
            <Button asChild>
              <Link href={`/coordinator/students/${params.id}/placement`}>
                View Placement Status
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SupervisorHeader studentId={params.id} />

      <CurrentSupervisors student={student} />

      <SupervisorAssignmentForm {...assignmentData} studentId={params.id} />

      <SupervisorPlacementInfo placement={placement} />
    </div>
  );
}
