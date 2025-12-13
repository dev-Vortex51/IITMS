"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loading } from "@/components/ui/loading";
import { studentService, placementService } from "@/services/student.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import adminService from "@/services/admin.service";
import { toast } from "sonner";

export default function StudentPlacementPage({
  params,
}: {
  params: { id: string };
}) {
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [isCreateSupervisorOpen, setIsCreateSupervisorOpen] = useState(false);
  const [supervisorFormData, setSupervisorFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    companyAddress: "",
    position: "",
  });

  // Fetch student placement
  const { data: placement, isLoading } = useQuery({
    queryKey: ["placement", params.id],
    queryFn: () => studentService.getStudentPlacement(params.id),
    enabled: !!params.id,
  });

  // Fetch all supervisors to check if one already exists with this email
  const { data: supervisorsData } = useQuery({
    queryKey: ["supervisors"],
    queryFn: () => adminService.supervisorService.getAllSupervisors(),
    enabled: !!placement?.supervisorEmail,
  });

  // Check if supervisor already exists
  const supervisorExists = supervisorsData?.supervisors?.some(
    (sup: any) => sup.email === placement?.supervisorEmail
  );

  // Approve placement mutation
  const approveMutation = useMutation({
    mutationFn: (data: { remarks?: string }) =>
      placement
        ? placementService.approvePlacement(placement._id, data.remarks || "")
        : Promise.reject("No placement"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement", params.id] });
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      setRemarks("");
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to approve placement");
    },
  });

  // Reject placement mutation
  const rejectMutation = useMutation({
    mutationFn: (data: { remarks: string }) =>
      placement
        ? placementService.rejectPlacement(placement._id, data.remarks)
        : Promise.reject("No placement"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement", params.id] });
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      setRemarks("");
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to reject placement");
    },
  });

  // Create industrial supervisor mutation
  const createSupervisorMutation = useMutation({
    mutationFn: (data: any) =>
      adminService.supervisorService.createSupervisor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      queryClient.invalidateQueries({ queryKey: ["placement", params.id] });
      setIsCreateSupervisorOpen(false);
      setSupervisorFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyName: "",
        companyAddress: "",
        position: "",
      });
      toast.success("Industrial supervisor created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create supervisor";
      toast.error(errorMessage);
    },
  });

  // Pre-fill supervisor form from placement data
  const handlePrefillSupervisor = () => {
    if (placement) {
      const nameParts = placement.supervisorName?.split(" ") || [];
      setSupervisorFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: placement.supervisorEmail || "",
        phone: placement.supervisorPhone || "",
        companyName: placement.companyName || "",
        companyAddress: placement.companyAddress || "",
        position: placement.supervisorPosition || "",
      });
      setIsCreateSupervisorOpen(true);
    }
  };

  const handleCreateSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    createSupervisorMutation.mutate({
      ...supervisorFormData,
      role: "industrial_supervisor",
      type: "industrial",
    });
  };

  const handleApprove = () => {
    if (window.confirm("Are you sure you want to approve this placement?")) {
      approveMutation.mutate({ remarks });
    }
  };

  const handleReject = () => {
    if (!remarks.trim()) {
      setError("Please provide remarks for rejection");
      return;
    }
    if (window.confirm("Are you sure you want to reject this placement?")) {
      rejectMutation.mutate({ remarks });
    }
  };

  if (isLoading) {
    return <Loading />;
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
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  No Placement Registered
                </h3>
                <p className="text-muted-foreground mt-1">
                  This student has not submitted a placement application yet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = {
    approved: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      text: "Approved",
      variant: "success" as const,
    },
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      text: "Pending Review",
      variant: "warning" as const,
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      text: "Rejected",
      variant: "destructive" as const,
    },
  };

  const config = statusConfig[placement.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

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
          <h1 className="text-3xl font-bold text-primary">Placement Details</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage student placement
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <StatusIcon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <CardTitle>Placement Status</CardTitle>
                <CardDescription>
                  Submitted on{" "}
                  {new Date(placement.createdAt!).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <Badge variant={config.variant}>{config.text}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Placement Information */}
      <Card>
        <CardHeader>
          <CardTitle>Placement Information</CardTitle>
          <CardDescription>Company and training details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Company Name</Label>
              <p className="font-medium">{placement.companyName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Company Sector</Label>
              <p className="font-medium">{placement.companySector || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">Company Address</Label>
              <p className="font-medium">{placement.companyAddress}</p>
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

          {placement.acceptanceLetter && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Acceptance Letter
                  </Label>
                  <p className="font-medium">Document uploaded</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Industrial Supervisor Information */}
      {(placement.supervisorName || placement.supervisorEmail) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Industrial Supervisor</CardTitle>
                <CardDescription>
                  Student&apos;s supervisor at the placement organization
                </CardDescription>
              </div>

              <Button
                onClick={handlePrefillSupervisor}
                variant="default"
                size="sm"
              >
                <Link href="/coordinator/invitations">Invite Supervisor</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" />
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
      {placement.coordinator_remarks && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Coordinator Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{placement.coordinator_remarks}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Section - Only show if pending */}
      {placement.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Placement</CardTitle>
            <CardDescription>
              Approve or reject this placement application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">
                Remarks{" "}
                {placement.status === "pending" &&
                  "(Optional for approval, required for rejection)"}
              </Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add your remarks here..."
                rows={4}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {approveMutation.isPending
                  ? "Approving..."
                  : "Approve Placement"}
              </Button>
              <Button
                onClick={handleReject}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {rejectMutation.isPending ? "Rejecting..." : "Reject Placement"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
