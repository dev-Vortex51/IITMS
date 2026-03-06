"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { useStudentDetails } from "./_hooks/useStudentDetails";
import { StudentProfileHeader } from "./_components/StudentProfileHeader";
import { StudentPersonalInfoCard } from "./_components/StudentPersonalInfoCard";
import { StudentPlacementCard } from "./_components/StudentPlacementCard";
import { StudentSupervisorsCard } from "./_components/StudentSupervisorsCard";

export default function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { student, placement, isLoading, placementStatus } = useStudentDetails(
    params.id,
  );

  if (isLoading) {
    return <LoadingPage label="Loading student profile..." />;
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          title="Student Not Found"
          description="The student you are looking for does not exist or you do not have permission to view this profile."
          actionLabel="Return to Directory"
          onAction={() => {
            window.location.href = "/coordinator/students";
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 max-w-5xl">
      <PageHeader
        title="Student Profile"
        description="Student details, placement, supervisors, and activity summary."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/coordinator/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Link>
          </Button>
        }
      />
      <StudentProfileHeader
        student={student}
        studentId={params.id}
        placement={placement}
      />

      <div className="space-y-4 md:space-y-5">
        <StudentPersonalInfoCard student={student} />
        <StudentPlacementCard
          placement={placement}
          studentId={params.id}
          statusText={placementStatus.text}
          status={placement?.status}
        />
        <StudentSupervisorsCard
          student={student}
          placement={placement}
          studentId={params.id}
        />
      </div>
    </div>
  );
}
