"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Visit } from "../types";

interface VisitDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: Visit | null;
}

export function VisitDetailsDialog({ open, onOpenChange, visit }: VisitDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visit Details</DialogTitle>
          <DialogDescription>
            {visit
              ? `${visit.student.user.firstName} ${visit.student.user.lastName}`
              : "Visit record details"}
          </DialogDescription>
        </DialogHeader>

        {visit ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Student</Label>
                <p className="font-medium">
                  {visit.student.user.firstName} {visit.student.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{visit.student.matricNumber}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="capitalize">
                    {visit.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Visit Date</Label>
                <p className="font-medium">{new Date(visit.visitDate).toLocaleString()}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Visit Type</Label>
                <p className="capitalize font-medium">{visit.type}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Location / Link</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{visit.location || "Not provided"}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Objective</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{visit.objective || "Not provided"}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Feedback</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{visit.feedback || "Not provided"}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Score</Label>
              <p className="font-medium">{typeof visit.score === "number" ? `${visit.score}%` : "N/A"}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
