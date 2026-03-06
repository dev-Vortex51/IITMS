import { AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Logbook, Student } from "../types";
import { formatStudentName, getDepartmentalReview } from "../utils/logbook-ui";

const resolveEvidenceUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

interface LogbookReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: Student | null;
  selectedLogbook: Logbook | null;
  onSubmitReview: () => void;
  isSubmittingReview: boolean;
  onClose: () => void;
}

export function LogbookReviewDialog({
  open,
  onOpenChange,
  selectedStudent,
  selectedLogbook,
  onSubmitReview,
  isSubmittingReview,
  onClose,
}: LogbookReviewDialogProps) {
  const priorDepartmentalReview = selectedLogbook
    ? getDepartmentalReview(selectedLogbook)
    : undefined;
  const departmentalStatus =
    selectedLogbook?.departmentalReview?.status ||
    selectedLogbook?.departmentalReviewStatus ||
    selectedLogbook?.status;
  const normalizedDepartmentalStatus = (departmentalStatus || "").toLowerCase();
  const industrialStatus =
    selectedLogbook?.industrialReview?.status || selectedLogbook?.industrialReviewStatus;
  const industrialReview =
    selectedLogbook?.industrialReview ||
    selectedLogbook?.reviews?.find((review) => review.supervisorType === "industrial");
  const canReview =
    selectedLogbook?.status === "reviewed" &&
    (industrialStatus || "").toLowerCase() === "reviewed" &&
    !priorDepartmentalReview &&
    !["approved", "rejected", "reviewed"].includes(normalizedDepartmentalStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="box-border w-[min(42rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Review Logbook - Week {selectedLogbook?.weekNumber ?? "-"}
          </DialogTitle>
          <DialogDescription>
            {formatStudentName(selectedStudent)} ({selectedStudent?.matricNumber || "N/A"})
          </DialogDescription>
        </DialogHeader>

        {selectedLogbook ? (
          <div className="space-y-4">
            <div className="rounded-md border border-border/60 overflow-hidden">
              <InfoRow
                label="Period"
                value={`${new Date(selectedLogbook.startDate).toLocaleDateString()} - ${new Date(selectedLogbook.endDate).toLocaleDateString()}`}
              />
              <Separator />
              <InfoRow
                label="Tasks Performed"
                value={selectedLogbook.tasksPerformed || "N/A"}
                multiline
              />
              <Separator />
              <InfoRow
                label="Skills Acquired"
                value={selectedLogbook.skillsAcquired || "N/A"}
                multiline
              />
              <Separator />
              <InfoRow
                label="Challenges Faced"
                value={selectedLogbook.challenges || "N/A"}
                multiline
              />
              <Separator />
              <InfoRow
                label="Lessons Learned"
                value={selectedLogbook.lessonsLearned || "N/A"}
                multiline
              />
            </div>

            {selectedLogbook.evidence?.length ? (
              <div className="rounded-md border border-border/60 p-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Evidence
                </Label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedLogbook.evidence.map((file, index) => (
                    <a
                      key={`${file.path}-${index}`}
                      href={resolveEvidenceUrl(file.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md border border-border p-2 text-sm transition-colors hover:bg-muted/40"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {!canReview ? (
              <div className="rounded-lg bg-muted p-4">
                <Label className="text-sm font-medium">Previous Review</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    {departmentalStatus || "N/A"}
                  </p>
                  {priorDepartmentalReview?.rating !== undefined ? (
                    <p className="text-sm">
                      <span className="font-medium">Rating:</span>{" "}
                      {priorDepartmentalReview.rating}/10
                    </p>
                  ) : null}
                  {priorDepartmentalReview?.comment ? (
                    <p className="text-sm">
                      <span className="font-medium">Comment:</span>{" "}
                      {priorDepartmentalReview.comment}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                {industrialStatus !== "reviewed" ? (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-medium">Industrial Supervisor Review Pending</p>
                        <p className="mt-1 text-sm">
                          This logbook can only be approved after industrial review.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {industrialStatus ? (
                  <div className="rounded-lg bg-muted p-4">
                    <Label className="text-sm font-medium">Industrial Supervisor Review</Label>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{" "}
                        <Badge
                          variant={
                            industrialStatus === "reviewed"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {industrialStatus}
                        </Badge>
                      </p>
                      {industrialReview?.rating ? (
                        <p className="text-sm">
                          <span className="font-medium">Rating:</span>{" "}
                          {industrialReview.rating}/10
                        </p>
                      ) : null}
                      {industrialReview?.comment ? (
                        <p className="text-sm">
                          <span className="font-medium">Comment:</span>{" "}
                          {industrialReview.comment}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                  <p className="text-sm text-muted-foreground">
                    Final approval will publish this logbook as approved.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canReview ? (
            <Button disabled={isSubmittingReview} onClick={onSubmitReview}>
              {isSubmittingReview ? "Submitting..." : "Approve Logbook"}
            </Button>
          ) : null}
        </DialogFooter>
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
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
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
