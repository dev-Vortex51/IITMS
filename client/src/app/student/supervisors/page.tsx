"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { Loading } from "@/components/ui/loading";
import { studentService } from "@/services/student.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, Building2, Briefcase, Mail, Phone, User } from "lucide-react";
import { Supervisor } from "@/types/models";

// Type guard to check if supervisor is populated object
const isSupervisorObject = (
  supervisor: string | Supervisor
): supervisor is Supervisor => {
  return typeof supervisor === "object" && supervisor !== null;
};

export default function StudentSupervisorsPage() {
  const { user } = useAuth();

  const studentId = user?.profileData?._id;

  // Fetch student data with supervisors
  const { data: studentData, isLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => studentService.getStudentById(studentId!),
    enabled: !!studentId,
  });

  const student = studentData;

  // Fetch placement
  const { data: placement } = useQuery({
    queryKey: ["placement", studentId],
    queryFn: () => studentService.getStudentPlacement(studentId!),
    enabled: !!studentId,
    retry: false,
  });

  if (!placement) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Supervisors</h1>
          <p className="text-muted-foreground mt-2">
            Your assigned training supervisors
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  No Supervisors Assigned
                </h3>
                <p className="text-muted-foreground mt-1">
                  Supervisors will be assigned after your placement is approved
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading supervisors...</div>;
  }

  if (!student) {
    return <div>Student data not found</div>;
  }

  const hasSupervisors =
    student.departmentalSupervisor || student.industrialSupervisor;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Supervisors</h1>
        <p className="text-muted-foreground mt-2">
          Your assigned training supervisors
        </p>
      </div>

      {!hasSupervisors ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Supervisors Pending</h3>
                <p className="text-muted-foreground mt-1">
                  Your supervisors will be assigned by the coordinator soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Academic Supervisor */}
          {student.departmentalSupervisor &&
            isSupervisorObject(student.departmentalSupervisor) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Academic Supervisor</CardTitle>
                      <CardDescription>
                        Institution-based supervisor
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">
                          {student.departmentalSupervisor.name}
                        </p>
                      </div>
                    </div>

                    {student.departmentalSupervisor.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium">
                            <a
                              href={`mailto:${student.departmentalSupervisor.email}`}
                              className="text-primary hover:underline"
                            >
                              {student.departmentalSupervisor.email}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {student.departmentalSupervisor.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="font-medium">
                            <a
                              href={`tel:${student.departmentalSupervisor.phone}`}
                              className="text-primary hover:underline"
                            >
                              {student.departmentalSupervisor.phone}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {student.departmentalSupervisor.department && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">
                            Department
                          </Label>
                          <p className="font-medium">
                            {typeof student.departmentalSupervisor
                              .department === "object"
                              ? student.departmentalSupervisor.department.name
                              : student.departmentalSupervisor.department}
                          </p>
                        </div>
                      </div>
                    )}

                    {student.departmentalSupervisor.designation && (
                      <div className="p-3 rounded-lg bg-muted">
                        <Label className="text-muted-foreground">
                          Designation
                        </Label>
                        <p className="mt-1 font-medium">
                          {student.departmentalSupervisor.designation}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Industrial Supervisor */}
          {student.industrialSupervisor &&
            isSupervisorObject(student.industrialSupervisor) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Briefcase className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle>Industrial Supervisor</CardTitle>
                      <CardDescription>
                        Company-based supervisor
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">
                          {student.industrialSupervisor.name}
                        </p>
                      </div>
                    </div>

                    {student.industrialSupervisor.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium">
                            <a
                              href={`mailto:${student.industrialSupervisor.email}`}
                              className="text-primary hover:underline"
                            >
                              {student.industrialSupervisor.email}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {student.industrialSupervisor.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="font-medium">
                            <a
                              href={`tel:${student.industrialSupervisor.phone}`}
                              className="text-primary hover:underline"
                            >
                              {student.industrialSupervisor.phone}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {student.industrialSupervisor.company && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">
                            Company
                          </Label>
                          <p className="font-medium">
                            {student.industrialSupervisor.company}
                          </p>
                        </div>
                      </div>
                    )}

                    {student.industrialSupervisor.designation && (
                      <div className="p-3 rounded-lg bg-muted">
                        <Label className="text-muted-foreground">
                          Designation
                        </Label>
                        <p className="mt-1 font-medium">
                          {student.industrialSupervisor.designation}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {/* Placement Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Placement Details</CardTitle>
          <CardDescription>
            Your current industrial training placement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Company Name</Label>
              <p className="font-medium">{placement.companyName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Duration</Label>
              <p className="font-medium">
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
