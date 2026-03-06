"use client";

import { useQuery } from "@tanstack/react-query";
import { studentService, logbookService } from "@/services/student.service";
import {
  EmptyState,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  LogbookOverviewCard,
  PlacementDetailsCard,
  RecentLogbookEntriesCard,
  StudentInformationCard,
} from "./components/StudentOverviewSections";

export default function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch student details
  const { data: studentData, isLoading } = useQuery({
    queryKey: ["student", params.id],
    queryFn: () => studentService.getStudentById(params.id),
    enabled: !!params.id,
  });

  // Fetch student logbook entries
  const { data: logbookData } = useQuery({
    queryKey: ["logbook", params.id],
    queryFn: () => logbookService.getAllLogbooks({ student: params.id }),
    enabled: !!params.id,
  });

  const student = studentData;
  const placement = student?.currentPlacement;
  const logbookEntries = logbookData?.data || [];

  if (isLoading) {
    return <LoadingPage label="Loading student profile..." />;
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          title="Student Not Found"
          description="The student profile could not be found."
          actionLabel="Back to Students"
          onAction={() => {
            window.location.href = "/d-supervisor/students";
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 max-w-5xl">
      <PageHeader
        title="Student Profile"
        description="Student details, placement status, and logbook activity."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/d-supervisor/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Link>
          </Button>
        }
      />

      <StudentInformationCard student={student} />
      <PlacementDetailsCard placement={placement} />
      <LogbookOverviewCard logbookEntries={logbookEntries} />
      <RecentLogbookEntriesCard logbookEntries={logbookEntries} />
    </div>
  );
}
