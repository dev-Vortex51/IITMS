"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { studentService, placementService } from "@/services/student.service";
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
import { Briefcase, Upload, CheckCircle, XCircle, Clock } from "lucide-react";

export default function StudentPlacementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companySector: "",
    startDate: "",
    endDate: "",
    acceptanceLetter: null as File | null,
  });
  const [error, setError] = useState("");

  // Fetch student data
  const { data: students } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getAllStudents({ user: user?._id }),
    enabled: !!user,
  });

  const student = students?.data?.[0];

  // Fetch existing placement
  const { data: placement, isLoading } = useQuery({
    queryKey: ["placement", student?._id],
    queryFn: () => studentService.getStudentPlacement(student._id),
    enabled: !!student,
  });

  // Create placement mutation
  const createPlacementMutation = useMutation({
    mutationFn: (data: FormData) => placementService.createPlacement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement"] });
      setFormData({
        companyName: "",
        companyAddress: "",
        companySector: "",
        startDate: "",
        endDate: "",
        acceptanceLetter: null,
      });
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to submit placement");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.acceptanceLetter) {
      setError("Please upload your acceptance letter");
      return;
    }

    const data = new FormData();
    data.append("student", student._id);
    data.append("companyName", formData.companyName);
    data.append("companyAddress", formData.companyAddress);
    data.append("companySector", formData.companySector);
    data.append("startDate", formData.startDate);
    data.append("endDate", formData.endDate);
    data.append("acceptanceLetter", formData.acceptanceLetter);

    createPlacementMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, acceptanceLetter: e.target.files[0] });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Show existing placement if approved or pending
  if (placement) {
    const statusConfig = {
      approved: {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-50",
        text: "Approved",
      },
      pending: {
        icon: Clock,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        text: "Pending Review",
      },
      rejected: {
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        text: "Rejected",
      },
    };

    const config = statusConfig[placement.status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Placement Details</h1>
          <p className="text-muted-foreground mt-2">
            Your industrial training placement information
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <Icon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <CardTitle>Status: {config.text}</CardTitle>
                <CardDescription>
                  Submitted on{" "}
                  {new Date(placement.createdAt!).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Company Name</Label>
                <p className="font-medium">{placement.companyName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Sector</Label>
                <p className="font-medium">
                  {placement.companySector || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Start Date</Label>
                <p className="font-medium">
                  {new Date(placement.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">End Date</Label>
                <p className="font-medium">
                  {new Date(placement.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Company Address</Label>
              <p className="font-medium">{placement.companyAddress}</p>
            </div>

            {placement.coordinator_remarks && (
              <div className="p-4 rounded-lg bg-muted">
                <Label className="text-muted-foreground">
                  Coordinator Remarks
                </Label>
                <p className="mt-1">{placement.coordinator_remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show registration form if no placement exists
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Register Placement</h1>
        <p className="text-muted-foreground mt-2">
          Submit your industrial training placement details for approval
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Briefcase className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <CardTitle>Placement Information</CardTitle>
              <CardDescription>
                Provide details about your industrial training placement
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
                placeholder="ABC Corporation Ltd"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Company Address *</Label>
              <Input
                id="companyAddress"
                value={formData.companyAddress}
                onChange={(e) =>
                  setFormData({ ...formData, companyAddress: e.target.value })
                }
                required
                placeholder="123 Business Street, City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySector">Company Sector/Industry</Label>
              <Input
                id="companySector"
                value={formData.companySector}
                onChange={(e) =>
                  setFormData({ ...formData, companySector: e.target.value })
                }
                placeholder="e.g., Information Technology, Manufacturing"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="acceptanceLetter">
                Acceptance Letter * (PDF, max 5MB)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="acceptanceLetter"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                  className="cursor-pointer"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              {formData.acceptanceLetter && (
                <p className="text-sm text-muted-foreground">
                  Selected: {formData.acceptanceLetter.name}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={createPlacementMutation.isPending}
            >
              {createPlacementMutation.isPending
                ? "Submitting..."
                : "Submit Placement"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
