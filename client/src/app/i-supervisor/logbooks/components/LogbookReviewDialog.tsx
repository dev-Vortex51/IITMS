import { CheckCircle2, FileText, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Logbook } from "../types";

const resolveEvidenceUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

function getIndustrialReview(logbook: Logbook | null) {
  if (!logbook) return undefined;
  return (
    logbook.industrialReview ||
    logbook.reviews?.find((review) => review.supervisorType === "industrial")
  );
}

interface LogbookReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logbook: Logbook | null;
  onSubmitReview: (status: "reviewed" | "rejected") => void;
  isSubmittingReview: boolean;
}

export function LogbookReviewDialog({
  open,
  onOpenChange,
  logbook,
  onSubmitReview,
  isSubmittingReview,
}: LogbookReviewDialogProps) {
  const industrialReview = getIndustrialReview(logbook);
  const overallStatus = (logbook?.status || "").toLowerCase();
  const roleStatus = (logbook?.industrialReviewStatus || "").toLowerCase();
  const industrialStatus =
    overallStatus === "draft"
      ? "draft"
      : overallStatus === "approved" || overallStatus === "rejected"
        ? overallStatus
        : industrialReview?.status?.toLowerCase() ||
          (["approved", "rejected", "reviewed"].includes(roleStatus)
            ? roleStatus
            : "submitted");
  const isReviewable = industrialStatus === "submitted" && !industrialReview;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="box-border w-[min(48rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Logbook Week {logbook?.weekNumber ?? "-"}</DialogTitle>
          <DialogDescription>Review student&apos;s logbook entry</DialogDescription>
        </DialogHeader>

        {logbook ? (
          <div className="space-y-4">
            <div className="rounded-md border border-border/60 overflow-hidden">
              <InfoRow
                label="Period"
                value={`${new Date(logbook.startDate).toLocaleDateString()} - ${new Date(logbook.endDate).toLocaleDateString()}`}
              />
              <Separator />
              <InfoRow label="Tasks Performed" value={logbook.tasksPerformed || "N/A"} multiline />
              <Separator />
              <InfoRow label="Skills Acquired" value={logbook.skillsAcquired || "N/A"} multiline />
              <Separator />
              <InfoRow label="Challenges" value={logbook.challenges || "N/A"} multiline />
              <Separator />
              <InfoRow label="Lessons Learned" value={logbook.lessonsLearned || "N/A"} multiline />
            </div>

            {logbook.evidence?.length ? (
              <div className="rounded-md border border-border/60 p-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Evidence Files
                </Label>
                <div className="mt-1 space-y-2">
                  {logbook.evidence.map((file, index) => (
                    <a
                      key={`${file.path}-${index}`}
                      href={resolveEvidenceUrl(file.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md border border-border p-2 text-sm text-primary hover:bg-muted/40"
                    >
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {!isReviewable ? (
              <div className="rounded-md border border-border/60 p-4">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Your Previous Review
                </Label>
                <p className="mt-2 text-sm">
                  {industrialReview?.comment || `Status: ${industrialStatus || "N/A"}`}
                </p>
                {industrialReview?.rating ? (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Rating:</span> {industrialReview.rating}/10
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onSubmitReview("rejected")}
                    disabled={isSubmittingReview}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isSubmittingReview ? "Submitting..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => onSubmitReview("reviewed")}
                    disabled={isSubmittingReview}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isSubmittingReview ? "Submitting..." : "Review"}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[180px_1fr] md:items-start">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <p
        className={`min-w-0 text-sm font-medium text-foreground break-words [overflow-wrap:anywhere] ${
          multiline ? "whitespace-pre-wrap" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
