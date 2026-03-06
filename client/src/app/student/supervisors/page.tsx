"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Building2, CalendarDays, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  EmptyState,
  ErrorLocalState,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { studentService } from "@/services/student.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Supervisor } from "@/types/models";
import { SupervisorInfoCard } from "./components/SupervisorInfoCard";

const isSupervisorObject = (supervisor: string | Supervisor): supervisor is Supervisor => {
  return typeof supervisor === "object" && supervisor !== null;
};

export default function StudentSupervisorsPage() {
  useEffect(() => {
    document.title = "Supervisors | ITMS";
  }, []);

  const { user } = useAuth();
  const studentId = user?.profileData?.id;

  const {
    data: student,
    isLoading: isStudentLoading,
    isError: isStudentError,
    refetch: refetchStudent,
  } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => studentService.getStudentById(studentId!),
    enabled: !!studentId,
  });

  const {
    data: placement,
    isLoading: isPlacementLoading,
    isError: isPlacementError,
    refetch: refetchPlacement,
  } = useQuery({
    queryKey: ["placement", studentId],
    queryFn: () => studentService.getStudentPlacement(studentId!),
    enabled: !!studentId,
    retry: false,
  });

  if (isStudentLoading || isPlacementLoading) {
    return <LoadingPage label="Loading supervisors..." />;
  }

  if (isStudentError || isPlacementError) {
    return (
      <div className="space-y-4 md:space-y-5 max-w-5xl">
        <PageHeader
          title="Supervisors"
          description="Your assigned training supervisors"
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/student/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          }
        />
        <ErrorLocalState
          message="Supervisors could not be loaded right now."
          onRetry={() => {
            refetchStudent();
            refetchPlacement();
          }}
        />
      </div>
    );
  }

  if (!placement) {
    return (
      <div className="space-y-4 md:space-y-5 max-w-5xl">
        <PageHeader
          title="Supervisors"
          description="Your assigned training supervisors"
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/student/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          }
        />
        <Card className="shadow-sm border-border/50">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Supervisor Assignment</CardTitle>
            <CardDescription>Supervisor assignment depends on placement approval</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <EmptyState
              title="No Supervisors Assigned"
              description="Supervisors will be assigned after your placement is approved"
              icon={<Users className="h-6 w-6 text-accent-foreground" />}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4 md:space-y-5 max-w-5xl">
        <PageHeader
          title="Supervisors"
          description="Your assigned training supervisors"
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/student/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          }
        />
        <ErrorLocalState message="Student data was not found." />
      </div>
    );
  }

  const academicSupervisor =
    student.departmentalSupervisor || student.academicSupervisor;
  const industrialSupervisor = student.industrialSupervisor;
  const hasSupervisors = academicSupervisor || industrialSupervisor;

  return (
    <div className="space-y-4 md:space-y-5 max-w-5xl">
      <PageHeader
        title="Supervisors"
        description="Your assigned training supervisors"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/student/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        }
      />

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/30">
          <CardTitle className="text-lg">Assignment Snapshot</CardTitle>
          <CardDescription>Current status of your assigned supervisors</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-border/60 bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Assigned
              </p>
              <p className="mt-1 text-sm font-semibold">
                {hasSupervisors ? (academicSupervisor && industrialSupervisor ? "2/2" : "1/2") : "0/2"}
              </p>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Academic
              </p>
              <p className="mt-1 text-sm font-semibold">{academicSupervisor ? "Assigned" : "Pending"}</p>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Industrial
              </p>
              <p className="mt-1 text-sm font-semibold">{industrialSupervisor ? "Assigned" : "Pending"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasSupervisors ? (
        <Card className="shadow-sm border-border/50">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Assignment Status</CardTitle>
            <CardDescription>Supervisor assignment is in progress</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <EmptyState
              title="Supervisors Pending"
              description="Your supervisors will be assigned by the coordinator soon"
              icon={<Users className="h-6 w-6 text-accent-foreground" />}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 md:space-y-5">
          {academicSupervisor && isSupervisorObject(academicSupervisor) ? (
            <SupervisorInfoCard
              title="Academic Supervisor"
              description="Institution-based supervisor"
              icon={Building2}
              iconClassName="rounded-lg bg-primary/10 p-2 text-primary"
              supervisor={academicSupervisor}
              showDepartment
            />
          ) : null}

          {industrialSupervisor && isSupervisorObject(industrialSupervisor) ? (
            <SupervisorInfoCard
              title="Industrial Supervisor"
              description="Company-based supervisor"
              icon={Briefcase}
              iconClassName="rounded-lg bg-accent/10 p-2 text-accent-foreground"
              supervisor={industrialSupervisor}
              showCompany
            />
          ) : null}
        </div>
      )}

      <Card className="shadow-sm border-border/50">
        <CardHeader className="border-b border-border/60">
          <CardTitle>Placement Details</CardTitle>
          <CardDescription>Your current industrial training placement</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-border/60 overflow-hidden">
            <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[220px_1fr] md:items-center">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Company Name
              </Label>
              <p className="font-medium text-sm">{placement.companyName || "N/A"}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[220px_1fr] md:items-center">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Duration
              </Label>
              <p className="font-medium text-sm">
                {new Date(placement.startDate).toLocaleDateString()} -{" "}
                {new Date(placement.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
