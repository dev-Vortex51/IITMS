"use client";

import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { Assessment } from "@/types/models";
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
  Building2,
  Mail,
  Phone,
  ClipboardCheck,
  Calendar,
  MapPin,
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

  // Fetch student assessments
  const { data: assessmentsData } = useQuery({
    queryKey: ["assessments", params.id],
    queryFn: async () => {
      // This would fetch assessments for this student
      return { data: [] };
    },
    enabled: !!params.id,
  });

  const student = studentData;
  const placement = placementData;
  const assessments = assessmentsData?.data || [];

  if (isLoading) {
    return <div>Loading student details...</div>;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Student Not Found</h2>
        <Button asChild className="mt-4">
          <Link href="/i-supervisor/students">Back to Students</Link>
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

  const hasAssessment = assessments.length > 0;
  const latestAssessment = assessments[0] as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/i-supervisor/students">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {student.name || "Student"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {student.matricNumber || "N/A"}
          </p>
        </div>
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
              <p className="font-medium">{student.name || "N/A"}</p>
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
                {typeof student.user === "object" && student.user
                  ? student.user.email
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <p className="font-medium">{student.phoneNumber || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-1">
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

      {/* Placement Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
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
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    Company Name
                  </Label>
                  <p className="font-medium">
                    {placement.companyName || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Company Sector
                  </Label>
                  <p className="font-medium">
                    {placement.companySector || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Company Address
                  </Label>
                  <p className="font-medium">
                    {placement.companyAddress || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <p className="font-medium">
                    {placement.startDate
                      ? new Date(placement.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </Label>
                  <p className="font-medium">
                    {placement.endDate
                      ? new Date(placement.endDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No placement information available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Assessment Summary</CardTitle>
                <CardDescription>
                  Student performance evaluation
                </CardDescription>
              </div>
            </div>
            {hasAssessment && <Badge variant="success">Completed</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {hasAssessment ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg bg-primary/5">
                  <Label className="text-muted-foreground text-xs">
                    Overall Score
                  </Label>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {latestAssessment.totalScore || 0}%
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Label className="text-muted-foreground text-xs">
                    Technical Skills
                  </Label>
                  <p className="text-xl font-semibold mt-1">
                    {latestAssessment.technicalSkills || "--"}/100
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Label className="text-muted-foreground text-xs">
                    Work Attitude
                  </Label>
                  <p className="text-xl font-semibold mt-1">
                    {latestAssessment.workAttitude || "--"}/100
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Assessment Date</Label>
                <p className="font-medium">
                  {latestAssessment.createdAt
                    ? new Date(latestAssessment.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              {latestAssessment.comments && (
                <div>
                  <Label className="text-muted-foreground">Comments</Label>
                  <p className="font-medium mt-1">
                    {latestAssessment.comments}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground">
                  No assessment submitted yet
                </p>
                <Button className="mt-4" disabled>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" disabled>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {hasAssessment ? "Update Assessment" : "Create Assessment"}
            </Button>
            <Button variant="outline" disabled>
              View Performance History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
