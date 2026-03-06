"use client";

import Link from "next/link";
import { useSupervisorDetails } from "./hooks/useSupervisorDetails";
import { SupervisorProfileHeader } from "./components/SupervisorProfileHeader";
import { SupervisorInfoCard } from "./components/SupervisorInfoCard";
import { SupervisorMetrics } from "./components/SupervisorMetrics";
import { AssignedStudentsList } from "./components/AssignedStudentsList";
import {
  EmptyState,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SupervisorDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    supervisor,
    assignedStudents,
    isDepartmental,
    metrics,
    isLoading,
    isError,
  } = useSupervisorDetails(params.id);

  if (isLoading) {
    return <LoadingPage label="Loading profile..." />;
  }

  if (isError || !supervisor) {
    return (
      <div className="space-y-4 md:space-y-5 max-w-5xl">
        <PageHeader
          title="Supervisor Profile"
          description="Profile details and assigned students."
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/coordinator/supervisors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Link>
            </Button>
          }
        />
        <Card className="border-dashed border-2">
          <CardContent className="pt-8 pb-8">
            <EmptyState
              title="Supervisor Not Found"
              description="The requested profile does not exist or has been removed."
              icon={<AlertCircle className="h-10 w-10 text-destructive/50" />}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 max-w-5xl">
      <PageHeader
        title="Supervisor Profile"
        description="Profile, workload metrics, and assigned students."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/coordinator/supervisors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Link>
          </Button>
        }
      />

      <SupervisorProfileHeader supervisor={supervisor} isDepartmental={isDepartmental} />

      <SupervisorMetrics metrics={metrics} />

      <SupervisorInfoCard supervisor={supervisor} isDepartmental={isDepartmental} />

      <AssignedStudentsList students={assignedStudents} />
    </div>
  );
}
