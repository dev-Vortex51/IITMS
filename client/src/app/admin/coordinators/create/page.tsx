"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateCoordinatorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
  });
  const [error, setError] = useState("");

  // Fetch all departments for selection
  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => adminService.departmentService.getAllDepartments(),
  });

  // Generate default password for new coordinators
  const generateDefaultPassword = () => {
    // Default password format: Coord@YYYY (e.g., Coord@2025)
    const currentYear = new Date().getFullYear();
    return `Coord@${currentYear}`;
  };

  // Create coordinator mutation
  const createMutation = useMutation({
    mutationFn: (userData: any) => {
      // Create user with coordinator role, assigned department, and default password
      return (
        adminService.userService?.createUser({
          ...userData,
          role: "coordinator",
          password: generateDefaultPassword(),
        }) || Promise.reject("User service not available")
      );
    },
    onSuccess: () => {
      toast.success("Coordinator created successfully");
      router.push("/admin/coordinators");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create coordinator";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const departments = departmentsData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.department
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 sm:space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/admin/coordinators">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Coordinators</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
            Create Coordinator
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Add a new department coordinator
          </p>
        </div>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <UserCog className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            Coordinator Information
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter the details for the new coordinator. They will be assigned to
            manage the selected department.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="text-xs sm:text-sm text-destructive bg-destructive/10 p-2 sm:p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm sm:text-base">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  className="text-sm sm:text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm sm:text-base">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                  className="text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="coordinator@university.edu"
                className="text-sm sm:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm sm:text-base">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+234 xxx xxx xxxx"
                className="text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm sm:text-base">
                Assign to Department *
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department: any) => (
                    <SelectItem
                      key={department._id}
                      value={department._id}
                      className="text-sm"
                    >
                      <span className="block truncate">{department.name}</span>
                      <span className="text-xs text-muted-foreground block truncate">
                        {department.faculty?.name || "No Faculty"}
                        {department.coordinator && " - Has Coordinator"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs sm:text-sm text-muted-foreground">
                The coordinator will be assigned to manage this department
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 text-sm sm:text-base h-10 sm:h-11"
              >
                {createMutation.isPending
                  ? "Creating..."
                  : "Create Coordinator"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/coordinators")}
                className="flex-1 text-sm sm:text-base h-10 sm:h-11"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
