"use client";

import { useQuery } from "@tanstack/react-query";
import { Loading } from "@/components/ui/loading";
import { studentService } from "@/services/student.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  ArrowLeft,
  Briefcase,
  BookOpen,
  UserCheck,
  Mail,
  Building,
} from "lucide-react";
import Link from "next/link";

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

  // Fetch student placement
  const { data: placementData } = useQuery({
    queryKey: ["placement", params.id],
    queryFn: () => studentService.getStudentPlacement(params.id),
    enabled: !!params.id,
  });

  const student = studentData;
  const placement = placementData;

  if (isLoading) {
    return <div>Loading student details...</div>;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Student Not Found</h2>
        <Button asChild className="mt-4">
          <Link href="/coordinator/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  const getPlacementStatusBadge = () => {
    if (!placement) return <Badge variant="secondary">No Placement</Badge>;
    const status = placement.status;
    if (status === "approved") return <Badge variant="success">Approved</Badge>;
    if (status === "pending") return <Badge variant="warning">Pending</Badge>;
    if (status === "rejected")
      return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/coordinator/students">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {student.user?.firstName && student.user?.lastName
              ? `${student.user.firstName} ${student.user.lastName}`
              : "Student"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {student.matricNumber || "N/A"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href={`/coordinator/students/${params.id}/placement`}>
            <Briefcase className="h-4 w-4 mr-2" />
            Manage Placement
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/coordinator/students/${params.id}/supervisors`}>
            <UserCheck className="h-4 w-4 mr-2" />
            Assign Supervisors
          </Link>
        </Button>
      </div>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
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
              <p className="font-medium">
                {student.user?.firstName && student.user?.lastName
                  ? `${student.user.firstName} ${student.user.lastName}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Matric Number</Label>
              <p className="font-medium">{student.matricNumber || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="font-medium">
                {typeof student.user === "object" ? student.user?.email : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Level</Label>
              <p className="font-medium">{student.level || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-1">
                <Building className="h-4 w-4" />
                Department
              </Label>
              <p className="font-medium">
                {typeof student.department === "object"
                  ? student.department.name
                  : student.department || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Session</Label>
              <p className="font-medium">{student.session || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placement Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Briefcase className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Placement Status</CardTitle>
                <CardDescription>
                  Industrial training placement information
                </CardDescription>
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
                  <Label className="text-muted-foreground">Company Name</Label>
                  <p className="font-medium">
                    {placement.companyName || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Company Address
                  </Label>
                  <p className="font-medium">
                    {placement.companyAddress || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p className="font-medium">
                    {placement.startDate
                      ? new Date(placement.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <p className="font-medium">
                    {placement.endDate
                      ? new Date(placement.endDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/coordinator/students/${params.id}/placement`}>
                    View Full Details
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No placement registered yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supervisors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Supervisors</CardTitle>
                <CardDescription>
                  Assigned departmental and industrial supervisors
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-muted-foreground text-xs">
                  Departmental Supervisor
                </Label>
                {student?.departmentalSupervisor && (
                  <Badge variant="success" className="text-xs">
                    Assigned
                  </Badge>
                )}
              </div>
              <p className="font-medium mt-1">
                {student?.departmentalSupervisor
                  ? typeof student.departmentalSupervisor === "object"
                    ? student.departmentalSupervisor.name
                    : "Assigned"
                  : "Not Assigned"}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-muted-foreground text-xs">
                  Industrial Supervisor
                </Label>
                {student?.industrialSupervisor && (
                  <Badge variant="success" className="text-xs">
                    Assigned
                  </Badge>
                )}
              </div>
              <p className="font-medium mt-1">
                {student?.industrialSupervisor
                  ? typeof student.industrialSupervisor === "object"
                    ? student.industrialSupervisor.name
                    : "Assigned"
                  : "Not Assigned"}
              </p>
            </div>
          </div>
          {placement && (
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href={`/coordinator/students/${params.id}/supervisors`}>
                  Manage Supervisors
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
