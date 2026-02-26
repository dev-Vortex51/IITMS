"use client";

import { useSupervisorDetails } from "./hooks/useSupervisorDetails";
import { SupervisorProfileHeader } from "./components/SupervisorProfileHeader";
import { SupervisorInfoCard } from "./components/SupervisorInfoCard";
import { SupervisorMetrics } from "./components/SupervisorMetrics";
import { AssignedStudentsList } from "./components/AssignedStudentsList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Loading } from "@/components/ui/loading"; // Assuming you have this generic loader

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
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loading text="Loading profile..." />
      </div>
    );
  }

  if (isError || !supervisor) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive/50" />
        <h2 className="text-xl font-semibold">Supervisor Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested profile does not exist or has been removed.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/coordinator/supervisors">Return to Directory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <SupervisorProfileHeader
        supervisor={supervisor}
        isDepartmental={isDepartmental}
      />

      <SupervisorMetrics metrics={metrics} />

      <SupervisorInfoCard
        supervisor={supervisor}
        isDepartmental={isDepartmental}
      />

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <AssignedStudentsList students={assignedStudents} />

        {/* Activity Summary - Kept simple inline for now as it's static */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg">Activity Timeline</CardTitle>
            <CardDescription>
              Recent actions and system updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 flex flex-col items-center text-muted-foreground">
              <BookOpen className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium text-foreground">
                No recent activity
              </p>
              <p className="text-xs mt-1">
                Activities will appear here once the supervisor starts
                reviewing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
