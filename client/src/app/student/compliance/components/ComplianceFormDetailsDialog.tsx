"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ComplianceFormRecord } from "../types";

const typeLabelMap: Record<string, string> = {
  acceptance_letter: "Acceptance Letter",
  introduction_letter: "Introduction Letter",
  monthly_clearance: "Monthly Clearance",
  indemnity_form: "Indemnity Form",
  itf_form_8: "ITF Form 8",
  school_form: "School SIWES Form",
  final_clearance: "Final Clearance",
};

interface ComplianceFormDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ComplianceFormRecord | null;
}

export function ComplianceFormDetailsDialog({ open, onOpenChange, form }: ComplianceFormDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Compliance Form Details</DialogTitle>
          <DialogDescription>Submission and review record for this compliance form.</DialogDescription>
        </DialogHeader>

        {form ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Form Type</Label>
                <p className="font-medium">{typeLabelMap[form.formType] || form.formType}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="capitalize">
                    {form.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Title</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{form.title || "Not provided"}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Note</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{form.note || "Not provided"}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Review Comment</Label>
              <p className="rounded-lg bg-muted p-3 text-sm">{form.reviewComment || "Not provided"}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
