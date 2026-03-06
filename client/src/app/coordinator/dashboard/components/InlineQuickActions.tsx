"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { placementService } from "@/services/student.service";
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
import { Textarea } from "@/components/ui/textarea";

interface InlineQuickActionsProps {
  pendingPlacementCount: number;
}

export function InlineQuickActions({ pendingPlacementCount }: InlineQuickActionsProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const departmentId =
    typeof user?.department === "object"
      ? user?.department?.id
      : user?.departmentId || user?.department;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [rejectMode, setRejectMode] = useState(false);

  const { data: placementsResponse, isLoading: isLoadingPlacements } = useQuery({
    queryKey: ["placements", departmentId],
    queryFn: () =>
      placementService.getAllPlacements({
        department: departmentId,
        limit: 100,
      }),
    enabled: !!departmentId,
  });

  const pendingPlacements = useMemo(() => {
    const placements = placementsResponse?.data || [];
    return placements.filter((placement: any) => placement.status === "pending");
  }, [placementsResponse]);

  const nextPlacement = pendingPlacements[0] || null;

  const approveMutation = useMutation({
    mutationFn: async (placementId: string) =>
      placementService.approvePlacement(placementId, "Approved by coordinator"),
    onSuccess: () => {
      toast.success("Placement approved");
      setDialogOpen(false);
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["placements", departmentId] });
      queryClient.invalidateQueries({ queryKey: ["students", departmentId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve placement");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (params: { placementId: string; remarks: string }) =>
      placementService.rejectPlacement(params.placementId, params.remarks),
    onSuccess: () => {
      toast.success("Placement rejected");
      setDialogOpen(false);
      setReason("");
      setRejectMode(false);
      queryClient.invalidateQueries({ queryKey: ["placements", departmentId] });
      queryClient.invalidateQueries({ queryKey: ["students", departmentId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject placement");
    },
  });

  function openReviewDialog() {
    if (!nextPlacement) {
      toast.info("No pending placement to review");
      return;
    }
    setRejectMode(false);
    setReason("");
    setDialogOpen(true);
  }

  function submitAction() {
    if (!nextPlacement?.id) return;
    if (!rejectMode) {
      approveMutation.mutate(nextPlacement.id);
      return;
    }
    const remarks = reason.trim();
    if (!remarks) {
      toast.error("Rejection reason is required");
      return;
    }
    rejectMutation.mutate({ placementId: nextPlacement.id, remarks });
  }

  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

  return (
    <>
      <section className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        </div>
        <div className="space-y-3 p-4">
          <Button
            onClick={openReviewDialog}
            disabled={isLoadingPlacements || !nextPlacement}
            className="h-11 w-full justify-between"
          >
            <span className="inline-flex items-center gap-2">
              {isLoadingPlacements ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="h-4 w-4" />
              )}
              Review Next Placement
            </span>
            <Badge variant="secondary">{pendingPlacementCount}</Badge>
          </Button>

          <p className="text-xs text-muted-foreground">
            Approve or reject the next pending placement without leaving dashboard.
          </p>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-xl">
          <DialogHeader>
            <DialogTitle>Placement Review</DialogTitle>
            <DialogDescription>
              Review and decide on the next pending student placement.
            </DialogDescription>
          </DialogHeader>

          {nextPlacement ? (
            <div className="space-y-4">
              <div className="rounded-md border border-border/60 p-3">
                <p className="text-sm font-semibold text-foreground">
                  {nextPlacement.student?.name ||
                    `${nextPlacement.student?.user?.firstName || ""} ${nextPlacement.student?.user?.lastName || ""}`.trim() ||
                    "Student"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nextPlacement.student?.matricNumber || "N/A"} · {nextPlacement.companyName || "No company"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nextPlacement.position || "No position"} ·{" "}
                  {nextPlacement.startDate ? format(new Date(nextPlacement.startDate), "MMM d, yyyy") : "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={rejectMode ? "outline" : "default"}
                  onClick={() => setRejectMode(false)}
                  className="justify-start gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  type="button"
                  variant={rejectMode ? "destructive" : "outline"}
                  onClick={() => setRejectMode(true)}
                  className="justify-start gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>

              {rejectMode ? (
                <div className="space-y-2">
                  <Label htmlFor="coordinator-rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="coordinator-rejection-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Provide a clear reason for rejection."
                    rows={4}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setReason("");
                setRejectMode(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitAction}
              disabled={isSubmitting}
              variant={rejectMode ? "destructive" : "default"}
            >
              {isSubmitting
                ? "Submitting..."
                : rejectMode
                  ? "Reject Placement"
                  : "Approve Placement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
