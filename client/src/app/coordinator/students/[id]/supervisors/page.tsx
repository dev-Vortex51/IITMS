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
  const [industrialSupervisorId, setIndustrialSupervisorId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch student placement
  const { data: placement, isLoading: placementLoading } = useQuery({
    queryKey: ["placement", params.id],
    queryFn: () => studentService.getStudentPlacement(params.id),
    enabled: !!params.id,
  });

  // Fetch all departmental supervisors
  const { data: dSupervisorsData } = useQuery({
    queryKey: ["departmental-supervisors"],
    queryFn: () =>
      adminService.supervisorService.getAllSupervisors({
        type: "departmental",
      }),
  });

  // Fetch all industrial supervisors
  const { data: iSupervisorsData } = useQuery({
    queryKey: ["industrial-supervisors"],
    queryFn: () =>
      adminService.supervisorService.getAllSupervisors({ type: "industrial" }),
  });

  const departmentalSupervisors = dSupervisorsData?.data || [];
  const industrialSupervisors = iSupervisorsData?.data || [];

  // Set initial values when placement loads
  useState(() => {
    if (placement?.departmentalSupervisor) {
      const dsId =
        typeof placement.departmentalSupervisor === "object"
          ? placement.departmentalSupervisor._id
          : placement.departmentalSupervisor;
      setDepartmentalSupervisorId(dsId || "");
    }
    if (placement?.industrialSupervisor) {
      const isId =
        typeof placement.industrialSupervisor === "object"
          ? placement.industrialSupervisor._id
          : placement.industrialSupervisor;
      setIndustrialSupervisorId(isId || "");
    }
  });

  // Update supervisors mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      departmentalSupervisor?: string;
      industrialSupervisor?: string;
    }) => {
      // This would be an endpoint to assign supervisors to placement
      // For now, we'll use the placement service update method
      if (!placement) throw new Error("No placement found");
      return placementService.updatePlacement(placement._id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement", params.id] });
      queryClient.invalidateQueries({ queryKey: ["student", params.id] });
      setSuccess("Supervisors assigned successfully");
      setError("");
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to assign supervisors");
      setSuccess("");
    },
  });

  const handleSave = () => {
    const updates: any = {};
    if (departmentalSupervisorId) {
      updates.departmentalSupervisor = departmentalSupervisorId;
    }
    if (industrialSupervisorId) {
      updates.industrialSupervisor = industrialSupervisorId;
    }

    if (Object.keys(updates).length === 0) {
      setError("Please select at least one supervisor");
      return;
    }

    updateMutation.mutate(updates);
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
    typeof placement.departmentalSupervisor === "object"
      ? placement.departmentalSupervisor
      : null;
  const currentIndustrialSupervisor =
    typeof placement.industrialSupervisor === "object"
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
            Assign Supervisors
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage departmental and industrial supervisors
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
              <CardTitle>Assign Supervisors</CardTitle>
              <CardDescription>
                Select supervisors for this student
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

          <div className="grid gap-6 md:grid-cols-2">
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
                    departmentalSupervisors.map((supervisor: any) => (
                      <SelectItem key={supervisor._id} value={supervisor._id}>
                        {supervisor.name} -{" "}
                        {supervisor.department?.name || "N/A"}
                      </SelectItem>
                    ))
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

            <div className="space-y-2">
              <Label htmlFor="industrial-supervisor">
                Industrial Supervisor
              </Label>
              <Select
                value={industrialSupervisorId}
                onValueChange={setIndustrialSupervisorId}
              >
                <SelectTrigger id="industrial-supervisor">
                  <SelectValue placeholder="Select industrial supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {industrialSupervisors.length > 0 ? (
                    industrialSupervisors.map((supervisor: any) => (
                      <SelectItem key={supervisor._id} value={supervisor._id}>
                        {supervisor.name} - {supervisor.companyName || "N/A"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No supervisors available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {industrialSupervisors.length} available
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Assignments"}
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
