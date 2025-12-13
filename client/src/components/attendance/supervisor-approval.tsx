"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attendanceService,
  type AttendanceRecord,
  type DayStatus,
} from "@/services/attendance.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SupervisorApprovalInterfaceProps {
  placementId: string;
}

export function SupervisorApprovalInterface({
  placementId,
}: SupervisorApprovalInterfaceProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "reclassify" | null
  >(null);
  const [comment, setComment] = useState("");
  const [newDayStatus, setNewDayStatus] = useState<DayStatus | "">("");

  const queryClient = useQueryClient();

  // Fetch attendance records
  const { data: records, isLoading } = useQuery({
    queryKey: ["attendance", "placement", placementId],
    queryFn: () => attendanceService.getPlacementAttendance(placementId, {}),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      attendanceService.approveAttendance(id, { comment }),
    onSuccess: () => {
      toast.success("Attendance approved successfully!");
      resetDialog();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      attendanceService.rejectAttendance(id, comment),
    onSuccess: () => {
      toast.success("Attendance rejected successfully!");
      resetDialog();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject");
    },
  });

  // Reclassify mutation
  const reclassifyMutation = useMutation({
    mutationFn: ({
      id,
      dayStatus,
      comment,
    }: {
      id: string;
      dayStatus: DayStatus;
      comment: string;
    }) => attendanceService.reclassifyAttendance(id, { dayStatus, comment }),
    onSuccess: () => {
      toast.success("Day status reclassified successfully!");
      resetDialog();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reclassify");
    },
  });

  const resetDialog = () => {
    setSelectedRecord(null);
    setActionType(null);
    setComment("");
    setNewDayStatus("");
  };

  const handleApprove = () => {
    if (!selectedRecord) return;
    approveMutation.mutate({ id: selectedRecord._id, comment });
  };

  const handleReject = () => {
    if (!selectedRecord || !comment) {
      toast.error("Rejection reason is required");
      return;
    }
    rejectMutation.mutate({ id: selectedRecord._id, comment });
  };

  const handleReclassify = () => {
    if (!selectedRecord || !newDayStatus || !comment) {
      toast.error("Day status and comment are required");
      return;
    }
    reclassifyMutation.mutate({
      id: selectedRecord._id,
      dayStatus: newDayStatus as DayStatus,
      comment,
    });
  };

  const getDayStatusBadge = (dayStatus: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive"; label: string }
    > = {
      PRESENT_ON_TIME: { variant: "default", label: "Present On Time" },
      PRESENT_LATE: { variant: "secondary", label: "Present Late" },
      HALF_DAY: { variant: "secondary", label: "Half Day" },
      ABSENT: { variant: "destructive", label: "Absent" },
      EXCUSED_ABSENCE: { variant: "default", label: "Excused" },
      INCOMPLETE: { variant: "secondary", label: "Incomplete" },
    };

    const config = statusConfig[dayStatus] || {
      variant: "default" as const,
      label: dayStatus,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getApprovalBadge = (approvalStatus: string) => {
    const config: Record<
      string,
      { variant: "default" | "secondary" | "destructive"; label: string }
    > = {
      PENDING: { variant: "secondary", label: "Pending" },
      APPROVED: { variant: "default", label: "Approved" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      NEEDS_REVIEW: { variant: "secondary", label: "Needs Review" },
    };

    const status = config[approvalStatus] || {
      variant: "default" as const,
      label: approvalStatus,
    };
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Identify records that need attention, but render all for visibility
  const pendingRecords = (records || []).filter(
    (r) => r.approvalStatus === "PENDING" || r.approvalStatus === "NEEDS_REVIEW"
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Attendance Review
          </CardTitle>
          <CardDescription>
            Review and approve student attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records && records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record._id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">
                        {record.student.user.firstName}{" "}
                        {record.student.user.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {record.student.matricNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(record.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    {getDayStatusBadge(record.dayStatus)}
                    {getApprovalBadge(record.approvalStatus)}
                    {record.punctuality && (
                      <Badge
                        variant={
                          record.punctuality === "ON_TIME"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {record.punctuality === "ON_TIME"
                          ? "✓ On Time"
                          : "⏰ Late"}
                      </Badge>
                    )}
                  </div>

                  {/* Details */}
                  <div className="grid gap-2 text-sm">
                    {record.checkInTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Check-in:</span>
                        <span className="font-medium">
                          {format(new Date(record.checkInTime), "h:mm a")}
                        </span>
                      </div>
                    )}
                    {record.checkOutTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Check-out:</span>
                        <span className="font-medium">
                          {format(new Date(record.checkOutTime), "h:mm a")}
                        </span>
                      </div>
                    )}
                    {record.hoursWorked !== undefined && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Hours:</span>
                        <span className="font-medium">
                          {record.hoursWorked.toFixed(1)} hrs
                        </span>
                      </div>
                    )}
                    {record.absenceReason && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span>Absence Reason:</span>
                          <p className="text-muted-foreground">
                            {record.absenceReason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      disabled={
                        !(
                          record.approvalStatus === "PENDING" ||
                          record.approvalStatus === "NEEDS_REVIEW"
                        )
                      }
                      onClick={() => {
                        setSelectedRecord(record);
                        setActionType("approve");
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={
                        !(
                          record.approvalStatus === "PENDING" ||
                          record.approvalStatus === "NEEDS_REVIEW"
                        )
                      }
                      onClick={() => {
                        setSelectedRecord(record);
                        setActionType("reject");
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        !(
                          record.approvalStatus === "PENDING" ||
                          record.approvalStatus === "NEEDS_REVIEW"
                        )
                      }
                      onClick={() => {
                        setSelectedRecord(record);
                        setActionType("reclassify");
                        setNewDayStatus(record.dayStatus);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Reclassify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
              <p>No attendance records found for this placement.</p>
              <p className="text-sm">
                When there are submissions, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      {actionType !== null && (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) resetDialog();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" && "Approve Attendance"}
                {actionType === "reject" && "Reject Attendance"}
                {actionType === "reclassify" && "Reclassify Day Status"}
              </DialogTitle>
              <DialogDescription>
                {selectedRecord &&
                  `${selectedRecord.student.user.firstName} ${
                    selectedRecord.student.user.lastName
                  } - ${format(new Date(selectedRecord.date), "MMM d, yyyy")}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {actionType === "reclassify" && (
                <div className="space-y-2">
                  <Label>New Day Status</Label>
                  <Select
                    value={newDayStatus}
                    onValueChange={(value) =>
                      setNewDayStatus(value as DayStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT_ON_TIME">
                        Present On Time
                      </SelectItem>
                      <SelectItem value="PRESENT_LATE">Present Late</SelectItem>
                      <SelectItem value="HALF_DAY">Half Day</SelectItem>
                      <SelectItem value="ABSENT">Absent</SelectItem>
                      <SelectItem value="EXCUSED_ABSENCE">
                        Excused Absence
                      </SelectItem>
                      <SelectItem value="INCOMPLETE">Incomplete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  {actionType === "reject"
                    ? "Rejection Reason *"
                    : "Comment (Optional)"}
                </Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    actionType === "approve"
                      ? "Add optional comment..."
                      : actionType === "reject"
                      ? "Provide reason for rejection..."
                      : "Explain reason for reclassification..."
                  }
                  rows={3}
                  className={cn(
                    actionType === "reject" &&
                      !comment &&
                      "border-red-500 focus:border-red-500"
                  )}
                />
                {actionType === "reject" && !comment && (
                  <p className="text-xs text-red-600">
                    Rejection reason is required
                  </p>
                )}
                {actionType === "reclassify" && !comment && (
                  <p className="text-xs text-orange-600">
                    Comment is required for reclassification
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => resetDialog()}>
                Cancel
              </Button>
              {actionType === "approve" && (
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? "Approving..." : "Approve"}
                </Button>
              )}
              {actionType === "reject" && (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!comment || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </Button>
              )}
              {actionType === "reclassify" && (
                <Button
                  onClick={handleReclassify}
                  disabled={
                    !newDayStatus || !comment || reclassifyMutation.isPending
                  }
                >
                  {reclassifyMutation.isPending
                    ? "Reclassifying..."
                    : "Reclassify"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
