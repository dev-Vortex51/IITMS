"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMonths, format, subMonths } from "date-fns";
import { AlertCircle, CalendarIcon, FileText, Send } from "lucide-react";
import { attendanceService, type AttendanceRecord } from "@/services/attendance.service";
import { AtlassianTable, type AtlassianTableColumn } from "@/components/design-system/atlassian-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const getApprovalTone = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-800",
    PENDING: "bg-amber-100 text-amber-800",
    REJECTED: "bg-rose-100 text-rose-800",
    NEEDS_REVIEW: "bg-orange-100 text-orange-800",
  };
  return map[status] || "bg-slate-100 text-slate-700";
};

const labelize = (value: string) =>
  value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export function AbsenceRequestForm() {
  const [date, setDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: (data: { date: string; reason: string }) =>
      attendanceService.submitAbsenceRequest(data),
    onSuccess: () => {
      toast.success("Absence request submitted successfully");
      setDate(undefined);
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit absence request");
    },
  });

  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ["attendance", "absence", "requests"],
    queryFn: () =>
      attendanceService.getMyAttendance({
        startDate: format(subMonths(new Date(), 6), "yyyy-MM-dd"),
        endDate: format(addMonths(new Date(), 6), "yyyy-MM-dd"),
      }),
  });

  const absenceRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (record) => !!record.absenceReason,
      ),
    [attendanceRecords],
  );

  const columns: AtlassianTableColumn<AttendanceRecord>[] = [
    {
      id: "date",
      header: "Date",
      sortable: true,
      sortAccessor: (record) => new Date(record.date).getTime(),
      render: (record) => (
        <p className="text-sm font-medium">{format(new Date(record.date), "MMM d, yyyy")}</p>
      ),
    },
    {
      id: "dayStatus",
      header: "Classification",
      render: (record) => (
        <Badge className="bg-slate-100 text-slate-700" variant="secondary">
          {labelize(record.dayStatus)}
        </Badge>
      ),
    },
    {
      id: "approval",
      header: "Approval",
      render: (record) => (
        <Badge className={getApprovalTone(record.approvalStatus)} variant="secondary">
          {labelize(record.approvalStatus)}
        </Badge>
      ),
    },
  ];

  const characterCount = reason.length;
  const isValid = characterCount >= 10 && characterCount <= 500;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!isValid) {
      toast.error("Please provide a reason with at least 10 characters");
      return;
    }

    submitMutation.mutate({ date: format(date, "yyyy-MM-dd"), reason });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 shadow-sm border-border/60">
          <CardHeader className="border-b border-border/60 bg-muted/20">
            <CardTitle className="text-base">Request Absence</CardTitle>
            <CardDescription>
              Submit an absence request for supervisor review and classification.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="absence-date">Date of Absence</Label>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="absence-date"
                    type="date"
                    value={date ? format(date, "yyyy-MM-dd") : ""}
                    onChange={(event) => {
                      if (!event.target.value) {
                        setDate(undefined);
                        return;
                      }
                      const [year, month, day] = event.target.value.split("-");
                      setDate(new Date(Number(year), Number(month) - 1, Number(day)));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="absence-reason">Reason</Label>
                <Textarea
                  id="absence-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="Describe the reason for your absence and any supporting context."
                  className={cn(
                    "resize-none",
                    characterCount > 0 && characterCount < 10 ? "border-orange-400" : "",
                  )}
                />
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      "text-muted-foreground",
                      characterCount > 0 && characterCount < 10 ? "text-orange-700" : "",
                    )}
                  >
                    {characterCount}/500 characters
                  </span>
                  <span className="text-muted-foreground">Minimum 10 characters</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!date || !isValid || submitMutation.isPending}
                className="h-10 w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {submitMutation.isPending ? "Submitting..." : "Submit Absence Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/60 bg-muted/20">
            <CardTitle className="text-base">Request Policy</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
            <p className="inline-flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              Submit clear reasons. Requests may be rejected if context is insufficient.
            </p>
            <p className="inline-flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4" />
              Additional documentation may be requested by your supervisor.
            </p>
            <p className="inline-flex items-start gap-2">
              <CalendarIcon className="mt-0.5 h-4 w-4" />
              Requests are tracked in attendance history with approval status.
            </p>
          </CardContent>
        </Card>
      </div>

      <AtlassianTable
        title="Recent Absence Requests"
        subtitle="Last six months of absence-related records"
        loading={isLoading}
        data={absenceRecords}
        columns={columns}
        rowKey={(record) => String((record as any).id || (record as any)._id || record.date)}
        emptyTitle="No absence requests"
        emptyDescription="You have no absence requests in the selected period."
        emptyIcon={<CalendarIcon className="h-8 w-8 text-muted-foreground/50" />}
      />
    </div>
  );
}
