"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, Loader2, School, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  cn,
} from "@/lib/utils";
import adminService from "@/services/admin.service";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InlineQuickActionsProps {
  pendingPlacementsCount: number;
  className?: string;
}

export function InlineQuickActions({
  pendingPlacementsCount,
  className,
}: InlineQuickActionsProps) {
  const queryClient = useQueryClient();
  const [facultyDialogOpen, setFacultyDialogOpen] = useState(false);
  const [placementDialogOpen, setPlacementDialogOpen] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ name: "", code: "", dean: "" });
  const [remarks, setRemarks] = useState("");
  const [rejectMode, setRejectMode] = useState(false);

  const placementsQuery = useQuery({
    queryKey: ["placements"],
    queryFn: () => placementService.getAllPlacements({}),
  });

  const pendingPlacements = useMemo(() => {
    const placements = placementsQuery.data?.data || [];
    return placements.filter((placement: any) => placement.status === "pending");
  }, [placementsQuery.data]);

  const nextPlacement = pendingPlacements[0] || null;

  const createFacultyMutation = useMutation({
    mutationFn: (payload: { name: string; code: string; dean?: string }) =>
      adminService.facultyService.createFaculty(payload),
    onSuccess: () => {
      toast.success("Faculty created successfully");
      setFacultyDialogOpen(false);
      setFacultyForm({ name: "", code: "", dean: "" });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create faculty");
    },
  });

  const approvePlacementMutation = useMutation({
    mutationFn: (placementId: string) =>
      placementService.approvePlacement(placementId, "Approved by admin"),
    onSuccess: () => {
      toast.success("Placement approved");
      setPlacementDialogOpen(false);
      setRejectMode(false);
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve placement");
    },
  });

  const rejectPlacementMutation = useMutation({
    mutationFn: (payload: { placementId: string; remarks: string }) =>
      placementService.rejectPlacement(payload.placementId, payload.remarks),
    onSuccess: () => {
      toast.success("Placement rejected");
      setPlacementDialogOpen(false);
      setRejectMode(false);
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject placement");
    },
  });

  function submitFaculty() {
    const name = facultyForm.name.trim();
    const code = facultyForm.code.trim();
    if (!name || !code) {
      toast.error("Faculty name and code are required");
      return;
    }
    createFacultyMutation.mutate({
      name,
      code,
      dean: facultyForm.dean.trim() || undefined,
    });
  }

  function openPlacementReview() {
    if (!nextPlacement) {
      toast.info("No pending placement to review");
      return;
    }
    setRejectMode(false);
    setRemarks("");
    setPlacementDialogOpen(true);
  }

  function submitPlacementReview() {
    if (!nextPlacement?.id) return;
    if (!rejectMode) {
      approvePlacementMutation.mutate(nextPlacement.id);
      return;
    }
    const reason = remarks.trim();
    if (!reason) {
      toast.error("Rejection reason is required");
      return;
    }
    rejectPlacementMutation.mutate({ placementId: nextPlacement.id, remarks: reason });
  }

  const placementSubmitting = approvePlacementMutation.isPending || rejectPlacementMutation.isPending;

  return (
    <>
      <section className={cn("rounded-md border border-border bg-card shadow-sm", className)}>
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        </div>
        <div className="space-y-3 p-4">
          <Button
            onClick={() => setFacultyDialogOpen(true)}
            variant="outline"
            className="h-11 w-full justify-start gap-2 border-border"
          >
            <School className="h-4 w-4" />
            Create Faculty
          </Button>

          <Button
            onClick={openPlacementReview}
            disabled={placementsQuery.isLoading}
            className="h-11 w-full justify-between"
          >
            <span className="inline-flex items-center gap-2">
              {placementsQuery.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="h-4 w-4" />
              )}
              Review Next Placement
            </span>
            <Badge variant="secondary">{pendingPlacementsCount}</Badge>
          </Button>
        </div>
      </section>

      <Dialog open={facultyDialogOpen} onOpenChange={setFacultyDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Faculty</DialogTitle>
            <DialogDescription>Add a faculty record quickly from dashboard.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="quick-faculty-name">Faculty Name</Label>
              <Input
                id="quick-faculty-name"
                value={facultyForm.name}
                onChange={(event) => setFacultyForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Faculty of Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-faculty-code">Faculty Code</Label>
              <Input
                id="quick-faculty-code"
                value={facultyForm.code}
                onChange={(event) => setFacultyForm((prev) => ({ ...prev, code: event.target.value }))}
                placeholder="ENG"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-faculty-dean">Dean (optional)</Label>
              <Input
                id="quick-faculty-dean"
                value={facultyForm.dean}
                onChange={(event) => setFacultyForm((prev) => ({ ...prev, dean: event.target.value }))}
                placeholder="Prof. Example"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFacultyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitFaculty}
              disabled={createFacultyMutation.isPending}
            >
              {createFacultyMutation.isPending ? "Creating..." : "Create Faculty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={placementDialogOpen} onOpenChange={setPlacementDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-xl">
          <DialogHeader>
            <DialogTitle>Placement Review</DialogTitle>
            <DialogDescription>Approve or reject the next pending placement.</DialogDescription>
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
                  <Label htmlFor="admin-placement-reason">Rejection Reason</Label>
                  <Textarea
                    id="admin-placement-reason"
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    rows={4}
                    placeholder="Provide reason for rejection."
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
                setPlacementDialogOpen(false);
                setRejectMode(false);
                setRemarks("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitPlacementReview}
              disabled={placementSubmitting}
              variant={rejectMode ? "destructive" : "default"}
            >
              {placementSubmitting
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
