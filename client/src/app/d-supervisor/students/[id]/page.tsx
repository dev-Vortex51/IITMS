"use client";

import { useQuery } from "@tanstack/react-query";
import { studentService, logbookService } from "@/services/student.service";
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
  Mail,
  Building,
  ClipboardCheck,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { LoadingCard } from "@/components/ui/loading";

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
    return <LoadingCard />;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Student Not Found</h2>
        <Button asChild className="mt-4">
          <Link href="/d-supervisor/students">Back to Students</Link>
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

  const pendingLogbooks = logbookEntries.filter(
    (entry: any) =>
      entry.status === "submitted" &&
      entry.departmentalReview?.status === "submitted"
  ).length;

  const approvedLogbooks = logbookEntries.filter(
    (entry: any) => entry.departmentalReview?.status === "approved"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/d-supervisor/students">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {student.user?.firstName} {student.user?.lastName}
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
              <p className="font-medium">
                {student.user?.firstName} {student.user?.lastName}
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
              <p className="font-medium">{student.user?.email || "N/A"}</p>
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
              <p className="font-medium">{student.department?.name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Session</Label>
              <p className="font-medium">{student.session || "N/A"}</p>
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
                <CardTitle>Placement Details</CardTitle>
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
                No placement registered yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logbook & Evaluation Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Logbook Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {logbookEntries.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">
                {pendingLogbooks}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {approvedLogbooks}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logbook Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Logbook Entries</CardTitle>
              <CardDescription>Latest weekly activity logs</CardDescription>
            </div>
            {logbookEntries.length > 0 && (
              <Badge variant="outline">{logbookEntries.length} Total</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {logbookEntries.length > 0 ? (
            <div className="space-y-3">
              {logbookEntries.slice(0, 5).map((entry: any) => {
                const reviewStatus =
                  entry.departmentalReview?.status || entry.status || "draft";
                const statusConfig = {
                  approved: { variant: "success" as const, text: "Approved" },
                  submitted: { variant: "warning" as const, text: "Pending" },
                  reviewed: { variant: "default" as const, text: "Reviewed" },
                  rejected: {
                    variant: "destructive" as const,
                    text: "Rejected",
                  },
                  draft: { variant: "secondary" as const, text: "Draft" },
                };
                const config =
                  statusConfig[reviewStatus as keyof typeof statusConfig] ||
                  statusConfig.draft;

                return (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Week {entry.weekNumber}</p>
                        <Badge variant={config.variant} className="text-xs">
                          {config.text}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {entry.tasksCompleted || "No tasks recorded"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.startDate && entry.endDate
                          ? `${new Date(
                              entry.startDate
                            ).toLocaleDateString()} - ${new Date(
                              entry.endDate
                            ).toLocaleDateString()}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No logbook entries yet</p>
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
              Create Evaluation
            </Button>
            <Button variant="outline" disabled>
              <BookOpen className="h-4 w-4 mr-2" />
              Review Logbooks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
