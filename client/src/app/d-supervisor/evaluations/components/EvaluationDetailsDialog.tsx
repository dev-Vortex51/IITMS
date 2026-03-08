"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Evaluation } from "../types";

interface EvaluationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: Evaluation | null;
}

const scoreEntries = [
  { key: "technicalSkill", label: "Technical Skill" },
  { key: "communication", label: "Communication" },
  { key: "professionalism", label: "Professionalism" },
  { key: "punctuality", label: "Punctuality" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "workAttitude", label: "Work Attitude" },
  { key: "initiative", label: "Initiative" },
];

export function EvaluationDetailsDialog({
  open,
  onOpenChange,
  evaluation,
}: EvaluationDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluation Details</DialogTitle>
          <DialogDescription>
            {evaluation
              ? `${evaluation.student.user.firstName} ${evaluation.student.user.lastName} (${evaluation.type})`
              : "Evaluation details"}
          </DialogDescription>
        </DialogHeader>

        {evaluation ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Student</Label>
                <p className="font-medium">
                  {evaluation.student.user.firstName} {evaluation.student.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{evaluation.student.matricNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="capitalize font-medium">{evaluation.type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge variant="outline" className="mt-1 capitalize">
                  {evaluation.status}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Grade</Label>
                <p className="text-xl font-semibold">{evaluation.grade || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Score</Label>
                <p className="text-xl font-semibold">
                  {typeof evaluation.totalScore === "number" ? `${evaluation.totalScore}%` : "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold">Score Breakdown</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {scoreEntries.map((entry) => {
                  const value = evaluation[entry.key as keyof Evaluation];
                  if (typeof value !== "number") {
                    return null;
                  }
                  return (
                    <div key={entry.key} className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <span className="text-sm font-medium">{entry.label}</span>
                      <Badge variant="secondary">{value}%</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {evaluation.strengths ? (
              <div className="space-y-2">
                <Label>Strengths</Label>
                <p className="rounded-lg bg-muted p-3 text-sm">{evaluation.strengths}</p>
              </div>
            ) : null}

            {evaluation.areasForImprovement ? (
              <div className="space-y-2">
                <Label>Areas for Improvement</Label>
                <p className="rounded-lg bg-muted p-3 text-sm">{evaluation.areasForImprovement}</p>
              </div>
            ) : null}

            {evaluation.comment ? (
              <div className="space-y-2">
                <Label>Comment</Label>
                <p className="rounded-lg bg-muted p-3 text-sm">{evaluation.comment}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
