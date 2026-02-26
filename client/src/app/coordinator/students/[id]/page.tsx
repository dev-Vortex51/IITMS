"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useStudentDetails } from "./_hooks/useStudentDetails";
import { StudentProfileHeader } from "./_components/StudentProfileHeader";
import { StudentPersonalInfoCard } from "./_components/StudentPersonalInfoCard";
import { StudentPlacementCard } from "./_components/StudentPlacementCard";
import { StudentSupervisorsCard } from "./_components/StudentSupervisorsCard";
import { StudentActivitySummary } from "./_components/StudentActivitySummary";

export default function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { student, placement, isLoading, placementStatus } = useStudentDetails(
    params.id,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading size="lg" />
        <p className="text-muted-foreground mt-4">Loading student profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-2xl">
          🔍
        </div>
        <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The student you are looking for doesn't exist or you don't have
          permission to view their profile.
        </p>
        <Button asChild>
          <Link href="/coordinator/students">Return to Directory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StudentProfileHeader student={student} studentId={params.id} />

      <div className="space-y-6">
        <StudentPersonalInfoCard student={student} />

        <StudentPlacementCard
          placement={placement}
          studentId={params.id}
          statusText={placementStatus.text}
          statusVariant={placementStatus.variant}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StudentSupervisorsCard
              student={student}
              placement={placement}
              studentId={params.id}
            />
          </div>
          <div className="lg:col-span-1">
            <StudentActivitySummary />
          </div>
        </div>
      </div>
    </div>
  );
}
