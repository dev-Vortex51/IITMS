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
import { School, ArrowLeft, Building, Save } from "lucide-react";
import Link from "next/link";

export default function FacultyDetailsPage({
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
    dean: "",
  });
  const [error, setError] = useState("");

  // Fetch faculty details
  const { data: facultyData, isLoading } = useQuery({
    queryKey: ["faculty", params.id],
    queryFn: () => adminService.facultyService.getFacultyById(params.id),
    enabled: !!params.id,
  });

  const faculty = facultyData;

  // Fetch departments under this faculty
  const { data: departmentsData } = useQuery({
    queryKey: ["departments", "faculty", params.id],
    queryFn: async () => {
      const response = await adminService.departmentService.getAllDepartments();
      // Filter departments by faculty
      return {
        ...response,
        data: response.data.filter(
          (dept: any) =>
            dept.faculty?._id === params.id || dept.faculty === params.id
        ),
      };
    },
    enabled: !!params.id,
  });

  const departments = departmentsData?.data || [];

  // Update faculty mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      adminService.facultyService.updateFaculty(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty", params.id] });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setIsEditing(false);
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update faculty");
    },
  });

  const handleEdit = () => {
    if (faculty) {
      setFormData({
        name: faculty.name || "",
        code: faculty.code || "",
        dean: faculty.dean || "",
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
    return <div>Loading faculty details...</div>;
  }

  if (!faculty) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Faculty Not Found</h2>
        <Button asChild className="mt-4">
          <Link href="/admin/faculties">Back to Faculties</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/admin/faculties">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary break-words">
            {faculty.name}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Faculty Code: {faculty.code}
          </p>
        </div>
      </div>

      {/* Faculty Details Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <School className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl">
                  Faculty Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage faculty details
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
                <Label htmlFor="name">Faculty Name *</Label>
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
                <Label htmlFor="code">Faculty Code *</Label>
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
                <Label htmlFor="dean">Dean Name</Label>
                <Input
                  id="dean"
                  value={formData.dean}
                  onChange={(e) =>
                    setFormData({ ...formData, dean: e.target.value })
                  }
                />
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
                <Label className="text-muted-foreground">Faculty Name</Label>
                <p className="font-medium">{faculty.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Faculty Code</Label>
                <p className="font-medium">{faculty.code}</p>
              </div>
              {faculty.dean && (
                <div>
                  <Label className="text-muted-foreground">Dean</Label>
                  <p className="font-medium">{faculty.dean}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">
                  {faculty.createdAt
                    ? new Date(faculty.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Departments Under Faculty */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Departments ({departments.length})
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Departments under this faculty
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departments.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {departments.map((dept: any) => (
                <div
                  key={dept._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/5 transition-colors gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10 shrink-0">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {dept.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Code: {dept.code}
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Link href={`/admin/departments/${dept._id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-muted-foreground">
              No departments under this faculty yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
