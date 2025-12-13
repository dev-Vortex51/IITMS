"use client";

import { useEffect, useState } from "react";
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

import { Loading } from "@/components/ui/loading";

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

  // Suggested academic supervisors (faculty-constrained)
  const {
    data: academicSuggestionsData,
    isLoading: academicSuggestionsLoading,
  } = useQuery({
    queryKey: ["supervisors", "suggestions", "academic", params.id],
    queryFn: () =>
      adminService.supervisorService.getSupervisorSuggestions(
        params.id,
        "academic"
      ),
    enabled: !!params.id,
  });

  // Suggested industrial supervisors (company-matched)
  const {
    data: industrialSuggestionsData,
    isLoading: industrialSuggestionsLoading,
  } = useQuery({
    queryKey: ["supervisors", "suggestions", "industrial", params.id],
    queryFn: () =>
      adminService.supervisorService.getSupervisorSuggestions(
        params.id,
        "industrial"
      ),
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

  // Fetch all industrial supervisors (manual override) - filtered by student's company if available
  const { data: industrialSupervisorsData } = useQuery({
    queryKey: ["supervisors", "industrial", placement?.companyName],
    queryFn: () => {
      const params: any = { type: "industrial" };
      if (placement?.companyName) {
        params.companyName = placement.companyName;
      }
      return adminService.supervisorService.getAllSupervisors(params);
    },
    enabled: !!placement,
  });

  const departmentalSupervisors = dSupervisorsData?.data || [];
  const academicSuggestions = academicSuggestionsData?.data || [];
  const industrialSuggestions = industrialSuggestionsData?.data || [];
  const industrialSupervisors = industrialSupervisorsData?.data || [];
  const academicList = departmentalSupervisors.length
    ? departmentalSupervisors
    : academicSuggestions;
  const industrialList = industrialSuggestions.length
    ? industrialSuggestions
    : industrialSupervisors;

  // Set initial values when student data or suggestions load
  useEffect(() => {
    if (student?.departmentalSupervisor) {
      const dsId =
        typeof student.departmentalSupervisor === "object"
          ? student.departmentalSupervisor._id
          : student.departmentalSupervisor;
      setDepartmentalSupervisorId(dsId || "");
    } else if (!departmentalSupervisorId && academicSuggestions.length > 0) {
      setDepartmentalSupervisorId(academicSuggestions[0]._id);
    }

    if (student?.industrialSupervisor) {
      const isId =
        typeof student.industrialSupervisor === "object"
          ? student.industrialSupervisor._id
          : student.industrialSupervisor;
      setIndustrialSupervisorId(isId || "");
    } else if (!industrialSupervisorId && industrialSuggestions.length > 0) {
      setIndustrialSupervisorId(industrialSuggestions[0]._id);
    }
  }, [
    student,
    academicSuggestions,
    industrialSuggestions,
    departmentalSupervisorId,
    industrialSupervisorId,
  ]);

  // Update departmental supervisor mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      departmentalSupervisor?: string;
      industrialSupervisor?: string;
    }) => {
      if (!placement) throw new Error("No placement found");
      return placementService.updatePlacementByCoordinator(placement._id, data);
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
      setError("Please select an academic supervisor");
      return;
    }

    const payload: {
      departmentalSupervisor?: string;
      industrialSupervisor?: string;
    } = {
      departmentalSupervisor: departmentalSupervisorId,
    };

    if (industrialSupervisorId) {
      payload.industrialSupervisor = industrialSupervisorId;
    }

    updateMutation.mutate(payload as any);
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
  const currentIndustrialSupervisor = student?.industrialSupervisor;

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
            Assign Academic Supervisor
          </h1>
          <p className="text-muted-foreground mt-1">
            Assign an academic supervisor to this student
          </p>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Academic Supervisor</CardTitle>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded ml-auto">
                Faculty-based
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {currentDepartmentalSupervisor ? (
              <div>
                <p className="font-medium">
                  {typeof currentDepartmentalSupervisor === "object"
                    ? currentDepartmentalSupervisor.name ||
                      (typeof currentDepartmentalSupervisor.user === "object" &&
                      currentDepartmentalSupervisor.user?.firstName &&
                      currentDepartmentalSupervisor.user?.lastName
                        ? `${currentDepartmentalSupervisor.user.firstName} ${currentDepartmentalSupervisor.user.lastName}`
                        : "N/A")
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {typeof currentDepartmentalSupervisor === "object"
                    ? currentDepartmentalSupervisor.email ||
                      (typeof currentDepartmentalSupervisor.user === "object"
                        ? currentDepartmentalSupervisor.user?.email
                        : null) ||
                      "N/A"
                    : "N/A"}
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
                  {typeof currentIndustrialSupervisor === "object"
                    ? currentIndustrialSupervisor.name ||
                      (typeof currentIndustrialSupervisor.user === "object" &&
                      currentIndustrialSupervisor.user?.firstName &&
                      currentIndustrialSupervisor.user?.lastName
                        ? `${currentIndustrialSupervisor.user.firstName} ${currentIndustrialSupervisor.user.lastName}`
                        : "N/A")
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {typeof currentIndustrialSupervisor === "object"
                    ? currentIndustrialSupervisor.email ||
                      (typeof currentIndustrialSupervisor.user === "object"
                        ? currentIndustrialSupervisor.user?.email
                        : null) ||
                      "N/A"
                    : "N/A"}
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
              <CardTitle>Assign Academic Supervisor</CardTitle>
              <CardDescription>
                Select an academic supervisor from your faculty. Academic
                supervisors are faculty-constrained and can oversee up to 10
                students cross-department.
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
            <Label htmlFor="departmental-supervisor">Academic Supervisor</Label>
            <Select
              value={departmentalSupervisorId}
              onValueChange={setDepartmentalSupervisorId}
            >
              <SelectTrigger id="departmental-supervisor">
                <SelectValue placeholder="Select academic supervisor" />
              </SelectTrigger>
              <SelectContent>
                {academicList.length > 0 ? (
                  academicList.map((supervisor: any) => {
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
                        {supervisor.department?.name || "Cross-dept"}(
                        {studentCount}/{maxStudents} students)
                        {supervisor.suggestionReason
                          ? ` • ${supervisor.suggestionReason}`
                          : ""}
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
              {academicList.length} available
            </p>
            {academicSuggestions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                <p className="text-xs text-blue-900 font-medium">Recommended</p>
                <p className="text-xs text-blue-800">
                  {academicSuggestions[0].name} •{" "}
                  {academicSuggestions[0].suggestionReason || "Available"}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industrial-supervisor">Industrial Supervisor</Label>
            <Select
              value={industrialSupervisorId}
              onValueChange={setIndustrialSupervisorId}
            >
              <SelectTrigger id="industrial-supervisor">
                <SelectValue placeholder="Select industrial supervisor" />
              </SelectTrigger>
              <SelectContent>
                {industrialList.length > 0 ? (
                  industrialList.map((supervisor: any) => {
                    const studentCount =
                      supervisor.assignedStudents?.length || 0;
                    const maxStudents = supervisor.maxStudents || 10;
                    const isFull = studentCount >= maxStudents;
                    const isCurrentlyAssigned =
                      industrialSupervisorId === supervisor._id;

                    return (
                      <SelectItem
                        key={supervisor._id}
                        value={supervisor._id}
                        disabled={isFull && !isCurrentlyAssigned}
                      >
                        {supervisor.name} -{" "}
                        {supervisor.companyName || "Company"} ({studentCount}/
                        {maxStudents} students)
                        {supervisor.suggestionReason
                          ? ` • ${supervisor.suggestionReason}`
                          : ""}
                        {isFull && !isCurrentlyAssigned && " - Full"}
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem value="none" disabled>
                    No industrial supervisors available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {industrialList.length} available
            </p>
            {industrialSuggestions.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                <p className="text-xs text-green-900 font-medium">
                  Recommended
                </p>
                <p className="text-xs text-green-800">
                  {industrialSuggestions[0].name} •{" "}
                  {industrialSuggestions[0].suggestionReason || "Available"}
                </p>
              </div>
            )}
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
