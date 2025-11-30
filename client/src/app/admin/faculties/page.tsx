"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingCard } from "@/components/ui/loading";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { School, Plus, Edit, Trash2, Building } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FacultiesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    dean: "",
  });
  const [error, setError] = useState("");

  // Fetch all faculties
  const { data: facultiesData, isLoading } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => adminService.facultyService.getAllFaculties(),
  });

  const faculties = facultiesData?.data || [];

  // Create faculty mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.facultyService.createFaculty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setFormData({ name: "", code: "", dean: "" });
      setError("");
      setIsCreateDialogOpen(false);
      toast.success("Faculty created successfully");
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to create faculty";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Delete faculty mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.facultyService.deleteFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      toast.success("Faculty deleted successfully");
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to delete faculty";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createMutation.mutate(formData);
  };

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
            Faculties
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage faculties and their departments
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Faculty
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Faculty</DialogTitle>
              <DialogDescription>
                Add a new faculty to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Faculty Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Faculty of Science"
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
                  placeholder="e.g., SCI"
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
                  placeholder="e.g., Prof. John Doe"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Faculty"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Faculties Grid */}
      {isLoading ? (
        <LoadingCard />
      ) : faculties.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {faculties.map((faculty: any) => (
            <Card
              key={faculty._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <School className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{faculty.name}</CardTitle>
                      <CardDescription>Code: {faculty.code}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {faculty.dean && (
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Dean
                    </Label>
                    <p className="font-medium">{faculty.dean}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{faculty.departmentCount || 0} departments</span>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/admin/faculties/${faculty._id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(faculty._id, faculty.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <School className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No Faculties Yet</h3>
                <p className="text-muted-foreground mt-1">
                  Create your first faculty to get started
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
