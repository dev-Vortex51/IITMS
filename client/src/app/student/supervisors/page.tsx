"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
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

  // Fetch student data
  const { data: students } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getAllStudents(),
    enabled: !!user,
  });

  const student = students?.data?.[0];

  // Fetch placement with supervisors
  const { data: placement, isLoading } = useQuery({
    queryKey: ["placement", student?._id],
    queryFn: () => studentService.getStudentPlacement(student._id),
    enabled: !!student,
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

  const hasSupervisors =
    placement.departmentalSupervisor || placement.industrialSupervisor;

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
          {/* Departmental Supervisor */}
          {placement.departmentalSupervisor &&
            isSupervisorObject(placement.departmentalSupervisor) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Departmental Supervisor</CardTitle>
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
                          {placement.departmentalSupervisor.name}
                        </p>
                      </div>
                    </div>

                    {placement.departmentalSupervisor.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium">
                            <a
                              href={`mailto:${placement.departmentalSupervisor.email}`}
                              className="text-primary hover:underline"
                            >
                              {placement.departmentalSupervisor.email}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {placement.departmentalSupervisor.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="font-medium">
                            <a
                              href={`tel:${placement.departmentalSupervisor.phone}`}
                              className="text-primary hover:underline"
                            >
                              {placement.departmentalSupervisor.phone}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {placement.departmentalSupervisor.department && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">
                            Department
                          </Label>
                          <p className="font-medium">
                            {typeof placement.departmentalSupervisor
                              .department === "object"
                              ? placement.departmentalSupervisor.department.name
                              : placement.departmentalSupervisor.department}
                          </p>
                        </div>
                      </div>
                    )}

                    {placement.departmentalSupervisor.designation && (
                      <div className="p-3 rounded-lg bg-muted">
                        <Label className="text-muted-foreground">
                          Designation
                        </Label>
                        <p className="mt-1 font-medium">
                          {placement.departmentalSupervisor.designation}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Industrial Supervisor */}
          {placement.industrialSupervisor &&
            isSupervisorObject(placement.industrialSupervisor) && (
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
                          {placement.industrialSupervisor.name}
                        </p>
                      </div>
                    </div>

                    {placement.industrialSupervisor.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium">
                            <a
                              href={`mailto:${placement.industrialSupervisor.email}`}
                              className="text-primary hover:underline"
                            >
                              {placement.industrialSupervisor.email}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {placement.industrialSupervisor.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="font-medium">
                            <a
                              href={`tel:${placement.industrialSupervisor.phone}`}
                              className="text-primary hover:underline"
                            >
                              {placement.industrialSupervisor.phone}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {placement.industrialSupervisor.company && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <Label className="text-muted-foreground">
                            Company
                          </Label>
                          <p className="font-medium">
                            {placement.industrialSupervisor.company}
                          </p>
                        </div>
                      </div>
                    )}

                    {placement.industrialSupervisor.designation && (
                      <div className="p-3 rounded-lg bg-muted">
                        <Label className="text-muted-foreground">
                          Designation
                        </Label>
                        <p className="mt-1 font-medium">
                          {placement.industrialSupervisor.designation}
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
