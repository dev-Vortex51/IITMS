"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap, School, UserCog } from "lucide-react";
import { useAcademicSupervisorDetails } from "./hooks/useAcademicSupervisorDetails";
import { AcademicSupervisorProfile } from "./components/AcademicSupervisorProfile";
import { SupervisorStudentsTable } from "./components/SupervisorStudentsTable";
import {
  EmptyState,
  ErrorGlobalState,
  LoadingPage,
  PageHeader,
  SectionCard,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";

export default function AcademicSupervisorDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { supervisor, isLoading, isError, error, refetch } =
    useAcademicSupervisorDetails(params.id);

  if (isLoading) {
    return <LoadingPage label="Loading academic supervisor details..." />;
  }

  if (isError) {
    return (
      <ErrorGlobalState
        title="Unable to load supervisor"
        message={error?.message || "Please try again."}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!supervisor) {
    return (
      <div className="space-y-4 md:space-y-5">
        <PageHeader
          title="Supervisor Not Found"
          description="The requested academic supervisor could not be located."
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/academic-supervisors">Back to Supervisors</Link>
            </Button>
          }
        />
        <EmptyState
          title="No supervisor record"
          description="This supervisor doesn't exist or has been removed."
          icon={<UserCog className="h-10 w-10 text-muted-foreground/50" />}
        />
      </div>
    );
  }

  const students = supervisor.assignedStudents || supervisor.students || [];
  const currentLoad = students.length;
  const maxLoad = Number(supervisor.maxStudents || 10);
  const availability = currentLoad < maxLoad ? "Available" : "Full";

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title={supervisor.name || "Academic Supervisor"}
        description="Supervisor profile and assigned student coverage."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/academic-supervisors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Supervisors
            </Link>
          </Button>
        }
      />

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <School className="h-4 w-4" />
            <span>
              Department:{" "}
              {typeof supervisor.department === "object"
                ? supervisor.department?.name || "N/A"
                : "N/A"}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>
              Load: {currentLoad} / {maxLoad}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <UserCog className="h-4 w-4" />
            <span>Status: {availability}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionCard
            title="Supervisor Profile"
            description="Core information and assignment context."
          >
            <AcademicSupervisorProfile supervisor={supervisor} />
          </SectionCard>
        </div>

        <div className="lg:col-span-8">
          <SupervisorStudentsTable students={students} />
        </div>
      </div>
    </div>
  );
}
