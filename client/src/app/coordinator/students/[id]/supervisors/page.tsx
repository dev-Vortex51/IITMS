"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService, placementService } from "@/services/student.service";
import adminService from "@/services/admin.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  ArrowLeft,
  Users,
  Building,
  Save,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function StudentSupervisorsPage({
  params,
}: {
  params: { id: string };
}) {
  const queryClient = useQueryClient();
  const [departmentalSupervisorId, setDepartmentalSupervisorId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch student data (departmental supervisor is stored in Student model)
  const { data: student } = useQuery({
    queryKey: ["student", params.id],
    queryFn: () => studentService.getStudentById(params.id),
    enabled: !!params.id,
  });

  // Fetch student placement
  const { data: placement, isLoading: placementLoading } = useQuery({
    queryKey: ["placement", params.id],
    queryFn: () => studentService.getStudentPlacement(params.id),
    enabled: !!params.id,
  });

  // Fetch all departmental supervisors
  const { data: dSupervisorsData } = useQuery({
    queryKey: ["supervisors", "departmental"],
    queryFn: () =>
      adminService.supervisorService.getAllSupervisors({
        type: "departmental",
      }),
  });

  const departmentalSupervisors = dSupervisorsData?.data || [];

  // Set initial values when student data loads
  useState(() => {
    if (student?.departmentalSupervisor) {
      const dsId =
        typeof student.departmentalSupervisor === "object"
          ? student.departmentalSupervisor._id
          : student.departmentalSupervisor;
      setDepartmentalSupervisorId(dsId || "");
    }
  });

  // Update departmental supervisor mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { departmentalSupervisor: string }) => {
      if (!placement) throw new Error("No placement found");
      return placementService.updatePlacement(placement._id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement", params.id] });
      queryClient.invalidateQueries({ queryKey: ["student", params.id] });
      setSuccess("Departmental supervisor assigned successfully");
      setError("");
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to assign supervisor");
      setSuccess("");
    },
  });

  const handleSave = () => {
    if (!departmentalSupervisorId) {
      setError("Please select a departmental supervisor");
      return;
    }

    updateMutation.mutate({ departmentalSupervisor: departmentalSupervisorId });
  };

  if (placementLoading) {
    return <div>Loading...</div>;
  }

  if (!placement) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/coordinator/students/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No Placement Found</h3>
                <p className="text-muted-foreground mt-1">
                  Student must have an approved placement before supervisors can
                  be assigned
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/coordinator/students/${params.id}/placement`}>
                  View Placement
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentDepartmentalSupervisor =
    typeof student?.departmentalSupervisor === "object"
      ? student.departmentalSupervisor
      : null;
  const currentIndustrialSupervisor =
    typeof placement?.industrialSupervisor === "object"
      ? placement.industrialSupervisor
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/coordinator/students/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Assign Departmental Supervisor
          </h1>
          <p className="text-muted-foreground mt-1">
            Assign a departmental supervisor to this student
          </p>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">
                Departmental Supervisor
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {currentDepartmentalSupervisor ? (
              <div>
                <p className="font-medium">
                  {currentDepartmentalSupervisor.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentDepartmentalSupervisor.email}
                </p>
                <Badge variant="success" className="mt-2">
                  Assigned
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground">Not assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Industrial Supervisor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {currentIndustrialSupervisor ? (
              <div>
                <p className="font-medium">
                  {currentIndustrialSupervisor.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentIndustrialSupervisor.email}
                </p>
                <Badge variant="success" className="mt-2">
                  Assigned
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground">Not assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Assign Departmental Supervisor</CardTitle>
              <CardDescription>
                Select a departmental supervisor for this student
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {success}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="departmental-supervisor">
              Departmental Supervisor
            </Label>
            <Select
              value={departmentalSupervisorId}
              onValueChange={setDepartmentalSupervisorId}
            >
              <SelectTrigger id="departmental-supervisor">
                <SelectValue placeholder="Select departmental supervisor" />
              </SelectTrigger>
              <SelectContent>
                {departmentalSupervisors.length > 0 ? (
                  departmentalSupervisors.map((supervisor: any) => {
                    const studentCount =
                      supervisor.assignedStudents?.length || 0;
                    const maxStudents = supervisor.maxStudents || 5;
                    const isFull = studentCount >= maxStudents;
                    const isCurrentlyAssigned =
                      departmentalSupervisorId === supervisor._id;

                    return (
                      <SelectItem
                        key={supervisor._id}
                        value={supervisor._id}
                        disabled={isFull && !isCurrentlyAssigned}
                      >
                        {supervisor.name} -{" "}
                        {supervisor.department?.name || "N/A"}({studentCount}/
                        {maxStudents} students)
                        {isFull && !isCurrentlyAssigned && " - Full"}
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem value="none" disabled>
                    No supervisors available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {departmentalSupervisors.length} available
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Assign Supervisor"}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/coordinator/students/${params.id}`}>Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Placement Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Placement Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 text-sm">
            <div>
              <Label className="text-muted-foreground text-xs">Company</Label>
              <p className="font-medium">{placement.companyName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Status</Label>
              <div className="mt-1">
                <Badge
                  variant={
                    placement.status === "approved" ? "success" : "warning"
                  }
                >
                  {placement.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
