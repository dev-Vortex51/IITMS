"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  ClipboardCheck,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { studentService } from "@/services/student.service";
import {
  EmptyState,
  ErrorGlobalState,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const studentQuery = useQuery({
    queryKey: ["student", params.id],
    queryFn: () => studentService.getStudentById(params.id),
    enabled: !!params.id,
  });

  const student = studentQuery.data;
  const placement = student?.currentPlacement;

  if (studentQuery.isLoading) {
    return <LoadingPage label="Loading student details..." />;
  }

  if (studentQuery.isError) {
    return (
      <ErrorGlobalState
        title="Unable to load student details"
        message={(studentQuery.error as Error)?.message || "Please try again."}
        onRetry={() => void studentQuery.refetch()}
      />
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Student Not Found"
          description="The requested student record could not be located."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/i-supervisor/students">Back to Students</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const getPlacementStatusBadge = () => {
    if (!placement) return <Badge variant="secondary">No Placement</Badge>;
    const status = placement.status;
    if (status === "approved") return <Badge variant="default">Approved</Badge>;
    if (status === "pending") return <Badge variant="outline">Pending</Badge>;
    if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const studentName =
    typeof student.user === "object" && student.user?.firstName && student.user?.lastName
      ? `${student.user.firstName} ${student.user.lastName}`
      : "Student";

  return (
    <div className="space-y-6">
      <PageHeader
        title={studentName}
        description={student.matricNumber || "N/A"}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/i-supervisor/students">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Personal and academic details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Full Name</Label>
              <p className="font-medium">{studentName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Matric Number</Label>
              <p className="font-medium">{student.matricNumber || "N/A"}</p>
            </div>
            <div>
              <Label className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="font-medium">
                {typeof student.user === "object" && student.user ? student.user.email : "N/A"}
              </p>
            </div>
            <div>
              <Label className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <p className="font-medium">{student.phoneNumber || "N/A"}</p>
            </div>
            <div>
              <Label className="flex items-center gap-1 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Department
              </Label>
              <p className="font-medium">
                {typeof student.department === "object" && student.department
                  ? (student.department as any).name
                  : student.department || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Level</Label>
              <p className="font-medium">{student.level || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <Briefcase className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Placement at Your Organization</CardTitle>
                <CardDescription>Training placement details</CardDescription>
              </div>
            </div>
            {getPlacementStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {placement ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Company Name
                  </Label>
                  <p className="font-medium">{placement.companyName || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company Sector</Label>
                  <p className="font-medium">{placement.companySector || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Company Address
                  </Label>
                  <p className="font-medium">{placement.companyAddress || "N/A"}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <p className="font-medium">
                    {placement.startDate ? new Date(placement.startDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </Label>
                  <p className="font-medium">
                    {placement.endDate ? new Date(placement.endDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No placement information"
              description="Placement details for this student are not available yet."
              icon={<Briefcase className="h-12 w-12 text-muted-foreground/50" />}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/i-supervisor/logbooks">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Review Logbooks
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/i-supervisor/students">View All Students</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
