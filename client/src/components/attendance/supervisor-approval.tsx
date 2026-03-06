/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Edit3, XCircle } from "lucide-react";
import {
  attendanceService,
  type AttendanceRecord,
  type DayStatus,
} from "@/services/attendance.service";
import {
  ActionMenu,
  AtlassianTable,
  type AtlassianTableColumn,
  FilterFieldSearch,
  FilterFieldSelect,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SupervisorApprovalInterfaceProps {
  placementId: string;
}

type DialogAction = "approve" | "reject" | "reclassify" | null;

function getRecordId(record: AttendanceRecord) {
  return String((record as any).id || record._id || `${record.student?._id}-${record.date}`);
}

function getStudentName(record: AttendanceRecord) {
  return `${record.student?.user?.firstName || ""} ${record.student?.user?.lastName || ""}`.trim() || "Student";
}

function isPending(record: AttendanceRecord) {
  return record.approvalStatus === "PENDING" || record.approvalStatus === "NEEDS_REVIEW";
}

function dayStatusBadge(dayStatus: string) {
  const labels: Record<string, string> = {
    PRESENT_ON_TIME: "On Time",
    PRESENT_LATE: "Late",
    HALF_DAY: "Half Day",
    ABSENT: "Absent",
    EXCUSED_ABSENCE: "Excused",
    INCOMPLETE: "Incomplete",
  };

  const destructive = dayStatus === "ABSENT";
  const secondary = dayStatus === "PRESENT_LATE" || dayStatus === "HALF_DAY" || dayStatus === "INCOMPLETE";
  const variant = destructive ? "destructive" : secondary ? "secondary" : "default";

  return <Badge variant={variant}>{labels[dayStatus] || dayStatus}</Badge>;
}

function approvalBadge(status: string) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    PENDING: { label: "Pending", variant: "secondary" },
    NEEDS_REVIEW: { label: "Needs Review", variant: "secondary" },
    APPROVED: { label: "Approved", variant: "default" },
    REJECTED: { label: "Rejected", variant: "destructive" },
  };

  const config = map[status] || { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function SupervisorApprovalInterface({ placementId }: SupervisorApprovalInterfaceProps) {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "pending" | "resolved">("all");
  const [action, setAction] = useState<DialogAction>(null);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [comment, setComment] = useState("");
  const [newDayStatus, setNewDayStatus] = useState<DayStatus | "">("");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance", "placement", placementId],
    queryFn: () => attendanceService.getPlacementAttendance(placementId, {}),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["attendance", "placement", placementId] });
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
  };

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      attendanceService.approveAttendance(id, { comment: note }),
    onSuccess: () => {
      toast.success("Attendance approved");
      resetDialog();
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve attendance");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      attendanceService.rejectAttendance(id, note),
    onSuccess: () => {
      toast.success("Attendance rejected");
      resetDialog();
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject attendance");
    },
  });

  const reclassifyMutation = useMutation({
    mutationFn: ({ id, dayStatus, note }: { id: string; dayStatus: DayStatus; note: string }) =>
      attendanceService.reclassifyAttendance(id, { dayStatus, comment: note }),
    onSuccess: () => {
      toast.success("Attendance reclassified");
      resetDialog();
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reclassify attendance");
    },
  });

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        getStudentName(record).toLowerCase().includes(query) ||
        (record.student?.matricNumber || "").toLowerCase().includes(query) ||
        (record.absenceReason || "").toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (approvalFilter === "pending") return isPending(record);
      if (approvalFilter === "resolved") return !isPending(record);
      return true;
    });
  }, [approvalFilter, records, searchQuery]);

  const summary = useMemo(() => {
    const pending = records.filter((record) => isPending(record)).length;
    return `${pending} pending · ${records.length - pending} resolved`;
  }, [records]);

  const columns: AtlassianTableColumn<AttendanceRecord>[] = [
    {
      id: "date",
      header: "Date",
      sortable: true,
      sortAccessor: (record) => new Date(record.date).getTime(),
      render: (record) => <span className="text-sm font-medium">{format(new Date(record.date), "EEE, MMM d")}</span>,
    },
    {
      id: "type",
      header: "Type",
      sortable: true,
      sortAccessor: (record) =>
        record.absenceReason
          ? "absence"
          : record.dayStatus === "INCOMPLETE"
            ? "incomplete"
            : "check-in",
      render: (record) => (
        <Badge variant="outline">
          {record.absenceReason
            ? "Absence"
            : record.dayStatus === "INCOMPLETE"
              ? "Incomplete"
              : "Check-in"}
        </Badge>
      ),
    },
    {
      id: "dayStatus",
      header: "Status",
      render: (record) => dayStatusBadge(record.dayStatus),
    },
    {
      id: "approval",
      header: "Approval",
      render: (record) => approvalBadge(record.approvalStatus),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      width: 56,
      render: (record) => (
        <ActionMenu
          items={[
            {
              label: "Approve",
              icon: <CheckCircle2 className="h-3.5 w-3.5" />,
              disabled: !isPending(record),
              onClick: () => openDialog(record, "approve"),
            },
            {
              label: "Reject",
              icon: <XCircle className="h-3.5 w-3.5" />,
              destructive: true,
              disabled: !isPending(record),
              onClick: () => openDialog(record, "reject"),
            },
            {
              label: "Reclassify",
              icon: <Edit3 className="h-3.5 w-3.5" />,
              disabled: !isPending(record),
              onClick: () => openDialog(record, "reclassify"),
            },
          ]}
        />
      ),
    },
  ];

  function openDialog(record: AttendanceRecord, nextAction: DialogAction) {
    setSelectedRecord(record);
    setAction(nextAction);
    setComment("");
    setNewDayStatus(record.dayStatus);
  }

  function resetDialog() {
    setAction(null);
    setSelectedRecord(null);
    setComment("");
    setNewDayStatus("");
  }

  function submitAction() {
    if (!selectedRecord || !action) return;

    const id = getRecordId(selectedRecord);

    if (action === "approve") {
      approveMutation.mutate({ id, note: comment.trim() || undefined });
      return;
    }

    if (action === "reject") {
      if (!comment.trim()) {
        toast.error("Rejection reason is required");
        return;
      }
      rejectMutation.mutate({ id, note: comment.trim() });
      return;
    }

    if (!newDayStatus || !comment.trim()) {
      toast.error("New status and reason are required");
      return;
    }

    reclassifyMutation.mutate({ id, dayStatus: newDayStatus as DayStatus, note: comment.trim() });
  }

  const submitting = approveMutation.isPending || rejectMutation.isPending || reclassifyMutation.isPending;

  return (
    <>
      <AtlassianTable
        title="Attendance Records"
        subtitle={summary}
        loading={isLoading}
        data={filteredRecords}
        columns={columns}
        rowKey={getRecordId}
        emptyTitle="No attendance records"
        emptyDescription="No entries match your current filters."
        emptyIcon={<AlertCircle className="h-6 w-6 text-accent-foreground" />}
        actions={
          <div className="grid w-full gap-2 sm:grid-cols-[minmax(220px,1fr)_180px] sm:items-center">
            <FilterFieldSearch
              placeholder="Search by matric number or reason..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full"
            />
            <FilterFieldSelect
              value={approvalFilter}
              onChange={(value) => setApprovalFilter(value as "all" | "pending" | "resolved")}
              placeholder="Approval"
              className="w-full"
              options={[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Resolved", value: "resolved" },
              ]}
            />
          </div>
        }
      />

      <Dialog open={!!action} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="box-border w-[min(38rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)]">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Attendance" : action === "reject" ? "Reject Attendance" : "Reclassify Attendance"}
            </DialogTitle>
            <DialogDescription>
              {selectedRecord ? `${getStudentName(selectedRecord)} (${selectedRecord.student?.matricNumber || "N/A"})` : ""}
            </DialogDescription>
          </DialogHeader>

          {action === "reclassify" ? (
            <div className="space-y-2">
              <Label>New Day Status</Label>
              <Select value={newDayStatus} onValueChange={(value) => setNewDayStatus(value as DayStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT_ON_TIME">Present On Time</SelectItem>
                  <SelectItem value="PRESENT_LATE">Present Late</SelectItem>
                  <SelectItem value="HALF_DAY">Half Day</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="EXCUSED_ABSENCE">Excused Absence</SelectItem>
                  <SelectItem value="INCOMPLETE">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>
              {action === "approve" ? "Comment (Optional)" : action === "reject" ? "Rejection Reason *" : "Reason *"}
            </Label>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              placeholder={
                action === "approve"
                  ? "Add note if needed..."
                  : action === "reject"
                    ? "Explain why this record is rejected..."
                    : "Explain the reclassification..."
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>Cancel</Button>
            <Button
              variant={action === "reject" ? "destructive" : "default"}
              onClick={submitAction}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : action === "approve"
                  ? "Approve"
                  : action === "reject"
                    ? "Reject"
                    : "Reclassify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
