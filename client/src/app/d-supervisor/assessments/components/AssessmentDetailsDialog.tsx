"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Assessment } from "../types";
import { calculateAverageScore, getRecommendationBadge, getStatusBadge } from "../utils/assessment-ui";

interface AssessmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment | null;
}

export function AssessmentDetailsDialog({
  open,
  onOpenChange,
  assessment,
}: AssessmentDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assessment Details</DialogTitle>
          <DialogDescription>
            {assessment && (
              <>
                {assessment.student.user?.firstName} {assessment.student.user?.lastName} -{" "}
                <span className="capitalize">{assessment.type}</span> Assessment
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {assessment && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Student</Label>
                <p className="font-medium">
                  {assessment.student.user?.firstName} {assessment.student.user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {assessment.student.matricNumber}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="font-medium capitalize">{assessment.type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(assessment.status)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Recommendation</Label>
                <div className="mt-1">
                  {getRecommendationBadge(assessment.recommendation)}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Average Score</Label>
                <p className="font-medium text-xl">
                  {calculateAverageScore(assessment.scores)}%
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Grade</Label>
                <p className="font-medium text-xl">{assessment.grade || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Scores</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(assessment.scores)
                  .filter(([_, value]) => value > 0)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-3 bg-muted rounded-lg"
                    >
                      <span className="capitalize font-medium">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <Badge variant="outline">{value}%</Badge>
                    </div>
                  ))}
              </div>
            </div>

            {assessment.strengths && (
              <div className="space-y-2">
                <Label>Strengths</Label>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {assessment.strengths}
                </p>
              </div>
            )}

            {assessment.areasForImprovement && (
              <div className="space-y-2">
                <Label>Areas for Improvement</Label>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {assessment.areasForImprovement}
                </p>
              </div>
            )}

            {assessment.comment && (
              <div className="space-y-2">
                <Label>General Comment</Label>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {assessment.comment}
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Created: {new Date(assessment.createdAt).toLocaleString()}
              {assessment.updatedAt !== assessment.createdAt && (
                <> • Updated: {new Date(assessment.updatedAt).toLocaleString()}</>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
