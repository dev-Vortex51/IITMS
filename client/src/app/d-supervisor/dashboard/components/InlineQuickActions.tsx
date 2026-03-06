"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { LogbookReviewDialog } from "../../logbooks/components/LogbookReviewDialog";
import type { Logbook, Student } from "../../logbooks/types";

interface InlineQuickActionsProps {
  supervisorId: string;
  pendingLogbookCount: number;
}

function getDepartmentalReview(logbook: any) {
  return (
    logbook?.departmentalReview ||
    logbook?.reviews?.find(
      (review: any) =>
        review?.supervisorType === "departmental" || review?.supervisorType === "academic",
    )
  );
}

function isReviewableForDepartment(logbook: any) {
  const overallStatus = String(logbook?.status || "").toLowerCase();
  const industrialStatus = String(
    logbook?.industrialReview?.status || logbook?.industrialReviewStatus || "",
  ).toLowerCase();
  const priorDepartmentalReview = getDepartmentalReview(logbook);
  const departmentalStatus = String(
    logbook?.departmentalReview?.status || logbook?.departmentalReviewStatus || "",
  ).toLowerCase();

  return (
    overallStatus === "reviewed" &&
    industrialStatus === "reviewed" &&
    !priorDepartmentalReview &&
    !["approved", "rejected", "reviewed"].includes(departmentalStatus)
  );
}

async function getNextDepartmentalLogbook(supervisorId: string): Promise<{
  logbook: Logbook;
  student: Student;
} | null> {
  const dashboard = await apiClient.get(`/supervisors/${supervisorId}/dashboard`);
  const students = dashboard.data?.data?.supervisor?.assignedStudents || [];
  const candidates: Array<{ logbook: Logbook; student: Student }> = [];

  for (const student of students) {
    const studentId = student?.id || student?._id;
    if (!studentId) continue;

    const response = await apiClient.get(`/logbooks?student=${studentId}`);
    const logbooks = response.data?.data || [];

    for (const entry of logbooks) {
      if (!isReviewableForDepartment(entry)) continue;

      const normalizedStudent: Student = {
        ...student,
        id: student.id || studentId,
        matricNumber: student.matricNumber || entry.student?.matricNumber || "N/A",
        user: {
          firstName: student.user?.firstName || entry.student?.user?.firstName || "",
          lastName: student.user?.lastName || entry.student?.user?.lastName || "",
          email: student.user?.email || entry.student?.user?.email || "",
        },
      };
      const normalizedLogbook: Logbook = {
        ...entry,
        id: entry.id || entry._id,
      };

      candidates.push({ logbook: normalizedLogbook, student: normalizedStudent });
    }
  }

  if (!candidates.length) return null;
  candidates.sort(
    (a, b) =>
      new Date(a.logbook.submittedAt || a.logbook.createdAt || 0).getTime() -
      new Date(b.logbook.submittedAt || b.logbook.createdAt || 0).getTime(),
  );
  return candidates[0];
}

export function InlineQuickActions({ supervisorId, pendingLogbookCount }: InlineQuickActionsProps) {
  const queryClient = useQueryClient();
  const [isLocating, setIsLocating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLogbook?.id) throw new Error("No logbook selected");
      await apiClient.post(`/logbooks/${selectedLogbook.id}/review`, {
        comment: "Approved by departmental supervisor",
        status: "approved",
      });
    },
    onSuccess: () => {
      toast.success("Logbook approved successfully");
      setDialogOpen(false);
      setSelectedLogbook(null);
      setSelectedStudent(null);
      queryClient.invalidateQueries({ queryKey: ["supervisor-dashboard", supervisorId] });
      queryClient.invalidateQueries({ queryKey: ["supervisor-students", supervisorId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve logbook");
    },
  });

  async function handleReviewNext() {
    if (!supervisorId) return;
    setIsLocating(true);
    try {
      const next = await getNextDepartmentalLogbook(supervisorId);
      if (!next) {
        toast.info("No reviewed logbook is awaiting final approval");
        return;
      }
      setSelectedLogbook(next.logbook);
      setSelectedStudent(next.student);
      setDialogOpen(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to load next logbook");
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <>
      <section className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        </div>
        <div className="space-y-3 p-4">
          <Button onClick={() => void handleReviewNext()} className="h-11 w-full justify-between">
            <span className="inline-flex items-center gap-2">
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
              Review Next Logbook
            </span>
            <Badge variant="secondary">{pendingLogbookCount}</Badge>
          </Button>
          <p className="text-xs text-muted-foreground">
            Opens the next industrial-reviewed logbook for final departmental approval.
          </p>
        </div>
      </section>

      <LogbookReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedStudent={selectedStudent}
        selectedLogbook={selectedLogbook}
        onSubmitReview={() => approveMutation.mutate()}
        isSubmittingReview={approveMutation.isPending}
        onClose={() => {
          setDialogOpen(false);
          setSelectedLogbook(null);
          setSelectedStudent(null);
        }}
      />
    </>
  );
}
