"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loading } from "@/components/ui/loading";
import { useRouter } from "next/navigation";
import adminService from "@/services/admin.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  ArrowLeft,
  Users,
  Save,
  School,
  UserCog,
} from "lucide-react";
import Link from "next/link";

export default function DepartmentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    faculty: "",
  });
  const [error, setError] = useState("");

  // Fetch department details
  const { data: departmentData, isLoading } = useQuery({
    queryKey: ["department", params.id],
    queryFn: () => adminService.departmentService.getDepartmentById(params.id),
    enabled: !!params.id,
  });

  // Fetch all faculties for dropdown
  const { data: facultiesData } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => adminService.facultyService.getAllFaculties(),
  });

  const department = departmentData;
  const faculties = facultiesData?.data || [];

  // Fetch individual coordinators for this department
  const coordinatorQueries = useQuery({
    queryKey: ["department-coordinators", department?.coordinators],
    queryFn: async () => {
      if (!department?.coordinators?.length) return [];

      // Ensure coordinators is treated as string array
      const coordinatorIds = Array.isArray(department.coordinators)
        ? (department.coordinators.filter(
            (id: any) => typeof id === "string"
          ) as string[])
        : [];

      const coordinatorPromises = coordinatorIds.map((coordinatorId: string) =>
        adminService.userService.getUserById(coordinatorId)
      );

      const results = await Promise.allSettled(coordinatorPromises);
      return results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value.data);
    },
    enabled: !!department?.coordinators?.length,
  });

  const coordinatorsList = coordinatorQueries.data || [];

  // Helper function to get coordinator info by ID from fetched data
  const getCoordinatorInfo = (coordinatorId: string) => {
    return coordinatorsList.find((coord: any) => coord._id === coordinatorId);
  };

  // Update department mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      adminService.departmentService.updateDepartment(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department", params.id] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsEditing(false);
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update department");
    },
  });

  const handleEdit = () => {
    if (department) {
      setFormData({
        name: department.name || "",
        code: department.code || "",
        faculty:
          typeof department.faculty === "object"
            ? department.faculty._id
            : department.faculty || "",
      });
      setIsEditing(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading department details...</div>;
  }

  if (!department) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Department Not Found</h2>
        <Button asChild className="mt-4">
          <Link href="/admin/departments">Back to Departments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/admin/departments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary break-words">
            {department.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Department Code: {department.code}
          </p>
        </div>
      </div>

      {/* Department Details Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl">
                  Department Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage department details
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Department Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty *</Label>
                <Select
                  value={formData.faculty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, faculty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty: any) => (
                      <SelectItem key={faculty._id} value={faculty._id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 w-full max-w-none">
              <div>
                <Label className="text-muted-foreground">Department Name</Label>
                <p className="font-medium">{department.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Department Code</Label>
                <p className="font-medium">{department.code}</p>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-1">
                  <School className="h-4 w-4" />
                  Faculty
                </Label>
                <p className="font-medium">
                  {typeof department.faculty === "object"
                    ? department.faculty.name
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-1">
                  <UserCog className="h-4 w-4" />
                  Coordinators ({department.coordinators?.length || 0})
                </Label>
                {department.coordinators &&
                department.coordinators.length > 0 ? (
                  <div className="space-y-2 mt-1">
                    {(department.coordinators as string[]).map(
                      (coordinatorId: string, index: number) => {
                        // Get coordinator info from individual queries
                        const coordinator = getCoordinatorInfo(coordinatorId);

                        return (
                          <div
                            key={coordinatorId}
                            className="p-3 border rounded-lg bg-accent/5 break-words"
                          >
                            {coordinatorQueries.isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-pulse bg-muted rounded"></div>
                                <p className="text-sm text-muted-foreground">
                                  Loading coordinator...
                                </p>
                              </div>
                            ) : (
                              <>
                                <p className="font-medium text-sm sm:text-base">
                                  {coordinator
                                    ? `${coordinator.firstName} ${coordinator.lastName}`
                                    : "Coordinator not found"}
                                </p>
                                {coordinator?.email && (
                                  <p className="text-xs sm:text-sm text-muted-foreground break-all">
                                    {coordinator.email}
                                  </p>
                                )}
                                {coordinator?.phone && (
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    {coordinator.phone}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <p className="font-medium text-muted-foreground">
                    No coordinators assigned
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">
                  {department.createdAt
                    ? new Date(department.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              <span className="text-xl sm:text-2xl font-bold">
                {department.students?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Active Placements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Supervisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
