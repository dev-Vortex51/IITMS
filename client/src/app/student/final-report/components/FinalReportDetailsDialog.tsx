"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { TechnicalReportRecord } from "../types";

interface FinalReportDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: TechnicalReportRecord | null;
}

export function FinalReportDetailsDialog({
  open,
  onOpenChange,
  report,
}: FinalReportDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Final Report Details</DialogTitle>
          <DialogDescription>Submission and review details for this final technical report.</DialogDescription>
        </DialogHeader>

        {report ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Student</Label>
                <p className="font-medium">
                  {report.student.user.firstName} {report.student.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{report.student.matricNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="capitalize">
                    {report.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Title</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{report.title || "Not provided"}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Abstract</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{report.abstract || "Not provided"}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Submission Note</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{report.note || "Not provided"}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Review Comment</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{report.reviewComment || "Not provided"}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
