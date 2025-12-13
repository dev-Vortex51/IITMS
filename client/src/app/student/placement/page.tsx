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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  MapPin,
  Calendar,
  Plus,
  FileText,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

export default function StudentPlacementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companySector: "",
    companyEmail: "",
    companyPhone: "",
    position: "",
    startDate: "",
    endDate: "",
    supervisorName: "",
    supervisorEmail: "",
    supervisorPhone: "",
    supervisorPosition: "",
  });

  // Get student profile ID from authenticated user
  const studentProfileId = user?.profileData?._id;

  // Fetch student data
  const { data: studentData, isLoading: isLoadingStudent } = useQuery({
    queryKey: ["student", studentProfileId],
    queryFn: async () => {
      if (!studentProfileId) {
        throw new Error("Student profile not found");
      }
      const response = await studentService.getStudentById(studentProfileId);
      return response;
    },
    enabled: !!studentProfileId,
  });

  const student = studentData;

  // Fetch existing placement
  const {
    data: placementData,
    isLoading: isLoadingPlacement,
    error: placementError,
  } = useQuery({
    queryKey: ["placement", student?._id],
    queryFn: () => studentService.getStudentPlacement(student!._id),
    enabled: !!student?._id,
    retry: false,
  });

  const placement = placementData;

  // Create placement mutation
  const createPlacementMutation = useMutation({
    mutationFn: (data: any) => placementService.createPlacement(data),
    onSuccess: () => {
      // Invalidate both student and placement queries
      queryClient.invalidateQueries({
        queryKey: ["student", studentProfileId],
      });
      queryClient.invalidateQueries({ queryKey: ["placement"] });
      // Force refetch placement
      queryClient.refetchQueries({ queryKey: ["placement", student?._id] });
      setIsDialogOpen(false);
      setFormData({
        companyName: "",
        companyAddress: "",
        companySector: "",
        companyEmail: "",
        companyPhone: "",
        position: "",
        startDate: "",
        endDate: "",
        supervisorName: "",
        supervisorEmail: "",
        supervisorPhone: "",
        supervisorPosition: "",
      });
      toast.success("Placement submitted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit placement");
    },
  });

  // Update placement mutation (edit before approval or change after approval)
  const updatePlacementMutation = useMutation({
    mutationFn: (data: any) =>
      placementService.updatePlacement(placement._id, data),
    onSuccess: () => {
      // Invalidate both student and placement queries
      queryClient.invalidateQueries({
        queryKey: ["student", studentProfileId],
      });
      queryClient.invalidateQueries({ queryKey: ["placement"] });
      queryClient.refetchQueries({ queryKey: ["placement", student?._id] });
      setIsDialogOpen(false);
      toast.success("Placement updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update placement");
    },
  });

  // Withdraw placement mutation
  const withdrawPlacementMutation = useMutation({
    mutationFn: () => placementService.withdrawPlacement(placement._id),
    onSuccess: () => {
      // Invalidate both student and placement queries
      queryClient.invalidateQueries({
        queryKey: ["student", studentProfileId],
      });
      queryClient.invalidateQueries({ queryKey: ["placement"] });
      queryClient.refetchQueries({ queryKey: ["placement", student?._id] });
      toast.success("Placement withdrawn successfully");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to withdraw placement"
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!student?._id) {
      toast.error("Student information not found. Please refresh the page.");
      return;
    }

    const data = {
      student: student._id,
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companySector: formData.companySector,
      companyEmail: formData.companyEmail,
      companyPhone: formData.companyPhone,
      position: formData.position,
      startDate: formData.startDate,
      endDate: formData.endDate,
      supervisorName: formData.supervisorName,
      supervisorEmail: formData.supervisorEmail,
      supervisorPhone: formData.supervisorPhone,
      supervisorPosition: formData.supervisorPosition,
    };

    createPlacementMutation.mutate(data);
  };

  const handleEditOrChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companySector: formData.companySector,
      companyEmail: formData.companyEmail,
      companyPhone: formData.companyPhone,
      position: formData.position,
      startDate: formData.startDate,
      endDate: formData.endDate,
      supervisorName: formData.supervisorName,
      supervisorEmail: formData.supervisorEmail,
      supervisorPhone: formData.supervisorPhone,
      supervisorPosition: formData.supervisorPosition,
    };

    updatePlacementMutation.mutate(data);
  };

  const handleOpenEditDialog = () => {
    if (placement) {
      setFormData({
        companyName: placement.companyName || "",
        companyAddress: placement.companyAddress || "",
        companySector: placement.companySector || "",
        companyEmail: placement.companyEmail || "",
        companyPhone: placement.companyPhone || "",
        position: placement.position || "",
        startDate: placement.startDate?.split("T")[0] || "",
        endDate: placement.endDate?.split("T")[0] || "",
        supervisorName: placement.supervisorName || "",
        supervisorEmail: placement.supervisorEmail || "",
        supervisorPhone: placement.supervisorPhone || "",
        supervisorPosition: placement.supervisorPosition || "",
      });
      setIsDialogOpen(true);
    }
  };

  const statusConfig = {
    approved: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      badgeVariant: "default" as const,
      text: "Approved",
    },
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      badgeVariant: "secondary" as const,
      text: "Pending Review",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      badgeVariant: "destructive" as const,
      text: "Rejected",
    },
    withdrawn: {
      icon: XCircle,
      color: "text-gray-600",
      bg: "bg-gray-50",
      badgeVariant: "secondary" as const,
      text: "Withdrawn",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Industrial Placement
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your industrial training placement information
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {(!placement ||
            ["withdrawn", "rejected"].includes(placement.status)) && (
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit Placement
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {placement &&
                !["withdrawn", "rejected"].includes(placement.status)
                  ? "Update Placement Details"
                  : "Submit Placement Details"}
              </DialogTitle>
              <DialogDescription>
                {placement
                  ? placement.status === "approved"
                    ? "Update your placement and resubmit for coordinator review"
                    : ["withdrawn", "rejected"].includes(placement.status)
                    ? "Submit a new placement application"
                    : "Update your placement details before approval"
                  : "Provide information about your industrial training placement"}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={
                placement &&
                !["withdrawn", "rejected"].includes(placement.status)
                  ? handleEditOrChangeSubmit
                  : handleSubmit
              }
            >
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyName: e.target.value,
                      })
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
                      setFormData({
                        ...formData,
                        companyAddress: e.target.value,
                      })
                    }
                    required
                    placeholder="123 Business Street, City, State"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySector">Company Sector</Label>
                  <Input
                    id="companySector"
                    value={formData.companySector}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companySector: e.target.value,
                      })
                    }
                    placeholder="e.g., Information Technology, Manufacturing"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email *</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={formData.companyEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyEmail: e.target.value,
                        })
                      }
                      required
                      placeholder="hr@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Company Phone *</Label>
                    <Input
                      id="companyPhone"
                      type="tel"
                      value={formData.companyPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyPhone: e.target.value,
                        })
                      }
                      required
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Your Position/Role *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position: e.target.value,
                      })
                    }
                    required
                    placeholder="e.g., Software Development Intern"
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
                        setFormData({
                          ...formData,
                          startDate: e.target.value,
                        })
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

                {/* Industrial Supervisor Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">
                    Industrial Supervisor Details
                  </h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supervisorName">Supervisor Name *</Label>
                      <Input
                        id="supervisorName"
                        value={formData.supervisorName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supervisorName: e.target.value,
                          })
                        }
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="supervisorEmail">
                          Supervisor Email *
                        </Label>
                        <Input
                          id="supervisorEmail"
                          type="email"
                          value={formData.supervisorEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              supervisorEmail: e.target.value,
                            })
                          }
                          required
                          placeholder="supervisor@company.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supervisorPhone">
                          Supervisor Phone *
                        </Label>
                        <Input
                          id="supervisorPhone"
                          type="tel"
                          value={formData.supervisorPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              supervisorPhone: e.target.value,
                            })
                          }
                          required
                          placeholder="+234 800 000 0000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supervisorPosition">
                        Supervisor Position *
                      </Label>
                      <Input
                        id="supervisorPosition"
                        value={formData.supervisorPosition}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supervisorPosition: e.target.value,
                          })
                        }
                        required
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    placement &&
                    !["withdrawn", "rejected"].includes(placement.status)
                      ? updatePlacementMutation.isPending
                      : createPlacementMutation.isPending
                  }
                >
                  {placement &&
                  !["withdrawn", "rejected"].includes(placement.status)
                    ? updatePlacementMutation.isPending
                      ? "Updating..."
                      : "Update Placement"
                    : createPlacementMutation.isPending
                    ? "Submitting..."
                    : "Submit Placement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Placement Details or Empty State */}
      {placement ? (
        <div className="space-y-6">
          {/* Status Card with Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-lg ${
                      statusConfig[
                        placement.status as keyof typeof statusConfig
                      ]?.bg || "bg-gray-50"
                    }`}
                  >
                    {(() => {
                      const Icon =
                        statusConfig[
                          placement.status as keyof typeof statusConfig
                        ]?.icon || Briefcase;
                      const color =
                        statusConfig[
                          placement.status as keyof typeof statusConfig
                        ]?.color || "text-gray-600";
                      return <Icon className={`h-6 w-6 ${color}`} />;
                    })()}
                  </div>
                  <div>
                    <CardTitle>Placement Status</CardTitle>
                    <CardDescription>
                      Submitted on{" "}
                      {new Date(placement.createdAt || "").toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      statusConfig[
                        placement.status as keyof typeof statusConfig
                      ]?.badgeVariant || "secondary"
                    }
                  >
                    {statusConfig[placement.status as keyof typeof statusConfig]
                      ?.text || placement.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              {placement.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleOpenEditDialog}
                    disabled={updatePlacementMutation.isPending}
                  >
                    Edit Details
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => withdrawPlacementMutation.mutate()}
                    disabled={withdrawPlacementMutation.isPending}
                  >
                    {withdrawPlacementMutation.isPending
                      ? "Withdrawing..."
                      : "Withdraw"}
                  </Button>
                </>
              )}
              {placement.status === "approved" && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleOpenEditDialog}
                    disabled={updatePlacementMutation.isPending}
                  >
                    Change Placement
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => withdrawPlacementMutation.mutate()}
                    disabled={withdrawPlacementMutation.isPending}
                  >
                    {withdrawPlacementMutation.isPending
                      ? "Withdrawing..."
                      : "Withdraw"}
                  </Button>
                </>
              )}
              {placement.status === "rejected" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Open new submission with empty form
                      setFormData({
                        companyName: "",
                        companyAddress: "",
                        companySector: "",
                        companyEmail: "",
                        companyPhone: "",
                        position: "",
                        startDate: "",
                        endDate: "",
                        supervisorName: "",
                        supervisorEmail: "",
                        supervisorPhone: "",
                        supervisorPosition: "",
                      });
                      setIsDialogOpen(true);
                    }}
                    disabled={createPlacementMutation.isPending}
                  >
                    Submit New Placement
                  </Button>
                </>
              )}
              {placement.status === "withdrawn" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      companyName: "",
                      companyAddress: "",
                      companySector: "",
                      companyEmail: "",
                      companyPhone: "",
                      position: "",
                      startDate: "",
                      endDate: "",
                      supervisorName: "",
                      supervisorEmail: "",
                      supervisorPhone: "",
                      supervisorPosition: "",
                    });
                    setIsDialogOpen(true);
                  }}
                  disabled={createPlacementMutation.isPending}
                >
                  Submit New Placement
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Details about your placement organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <Label className="text-muted-foreground">Company Name</Label>
                  <p className="font-medium">
                    {placement.companyName || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">
                    {placement.companyAddress || "N/A"}
                  </p>
                </div>
              </div>

              {placement.companySector && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-muted-foreground">Sector</Label>
                    <p className="font-medium">{placement.companySector}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Training Period */}
          <Card>
            <CardHeader>
              <CardTitle>Training Period</CardTitle>
              <CardDescription>
                Duration of your industrial training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-muted-foreground">Start Date</Label>
                    <p className="font-medium">
                      {new Date(placement.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-muted-foreground">End Date</Label>
                    <p className="font-medium">
                      {new Date(placement.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industrial Supervisor */}
          {(placement.supervisorName || placement.supervisorEmail) && (
            <Card>
              <CardHeader>
                <CardTitle>Industrial Supervisor</CardTitle>
                <CardDescription>
                  Your supervisor at the placement organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">
                      Supervisor Name
                    </Label>
                    <p className="font-medium">
                      {placement.supervisorName || "N/A"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Position</Label>
                    <p className="font-medium">
                      {placement.supervisorPosition || "N/A"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="font-medium">
                      {placement.supervisorEmail || "N/A"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <p className="font-medium">
                      {placement.supervisorPhone || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coordinator Remarks */}
          {placement.reviewComment && (
            <Card>
              <CardHeader>
                <CardTitle>Coordinator Remarks</CardTitle>
                <CardDescription>
                  Feedback from your coordinator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted">
                  <p>{placement.reviewComment}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-accent/10 mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              No Placement Submitted
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You haven&apos;t submitted your industrial training placement
              details yet. Click the button above to submit your placement
              information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
