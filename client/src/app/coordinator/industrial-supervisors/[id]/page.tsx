"use client";

import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
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
  Mail,
  Phone,
  Building2,
  MapPin,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export default function IndustrialSupervisorDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch supervisor details
  const { data: supervisorData, isLoading } = useQuery({
    queryKey: ["industrial-supervisor", params.id],
    queryFn: () => adminService.supervisorService.getSupervisorById(params.id),
    enabled: !!params.id,
  });

  const supervisor = supervisorData;

  if (isLoading) {
    return <div>Loading supervisor details...</div>;
  }

  if (!supervisor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Supervisor Not Found</h2>
        <Button asChild className="mt-4">
          <Link href="/coordinator/industrial-supervisors">
            Back to Supervisors
          </Link>
        </Button>
      </div>
    );
  }

  const assignedStudents = supervisor.students || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/coordinator/industrial-supervisors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary">
            {supervisor.name || "Supervisor"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Industrial Supervisor Details
          </p>
        </div>
        <Badge
          variant={supervisor.isActive !== false ? "success" : "secondary"}
        >
          {supervisor.isActive !== false ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Supervisor Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Supervisor Information</CardTitle>
              <CardDescription>Contact and company details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Full Name</Label>
              <p className="font-medium">{supervisor.name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="font-medium">{supervisor.email || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <p className="font-medium">{supervisor.phoneNumber || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Position/Title</Label>
              <p className="font-medium">{supervisor.position || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Building2 className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Organization details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                Company Name
              </Label>
              <p className="font-medium">{supervisor.companyName || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Sector/Industry</Label>
              <p className="font-medium">{supervisor.companySector || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Company Address
              </Label>
              <p className="font-medium">
                {supervisor.companyAddress || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {assignedStudents.length}
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
            <div className="text-2xl font-bold text-yellow-600">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Students */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assigned Students</CardTitle>
              <CardDescription>
                Students under this supervisor's guidance
              </CardDescription>
            </div>
            <Badge variant="outline">{assignedStudents.length} Students</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {assignedStudents.length > 0 ? (
            <div className="space-y-3">
              {assignedStudents.map((student: any) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{student.name || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.matricNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/coordinator/students/${student._id}`}>
                      View Student
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <p className="text-muted-foreground">No students assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Recent supervision activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activities</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
