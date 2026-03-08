"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EvaluationScore, StudentOption } from "../types";

interface EvaluationCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentOption[];
  selectedStudent: string;
  setSelectedStudent: (value: string) => void;
  evaluationType: "midterm" | "final";
  setEvaluationType: (value: "midterm" | "final") => void;
  scores: EvaluationScore;
  setScores: (scores: EvaluationScore) => void;
  strengths: string;
  setStrengths: (value: string) => void;
  areasForImprovement: string;
  setAreasForImprovement: (value: string) => void;
  comment: string;
  setComment: (value: string) => void;
  mode?: "create" | "edit";
  onSubmit: () => void;
  isSubmitting: boolean;
}

const scoreFields = [
  { key: "technicalSkill", label: "Technical Skill" },
  { key: "communication", label: "Communication" },
  { key: "professionalism", label: "Professionalism" },
  { key: "punctuality", label: "Punctuality" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "workAttitude", label: "Work Attitude" },
  { key: "initiative", label: "Initiative" },
];

const requiredFields = [
  "technicalSkill",
  "communication",
  "professionalism",
  "punctuality",
  "problemSolving",
];

export function EvaluationCreateDialog({
  open,
  onOpenChange,
  students,
  selectedStudent,
  setSelectedStudent,
  evaluationType,
  setEvaluationType,
  scores,
  setScores,
  strengths,
  setStrengths,
  areasForImprovement,
  setAreasForImprovement,
  comment,
  setComment,
  mode = "create",
  onSubmit,
  isSubmitting,
}: EvaluationCreateDialogProps) {
  const isEditMode = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Student Evaluation" : "Create Student Evaluation"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the evaluation details before submission."
              : "Record structured performance feedback for assigned students."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
                disabled={isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.user.firstName} {student.user.lastName} ({student.matricNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Evaluation Type *</Label>
              <Select
                value={evaluationType}
                onValueChange={(value) => setEvaluationType(value as "midterm" | "final")}
                disabled={isEditMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold">Scores (0-100)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {scoreFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>
                    {field.label} {requiredFields.includes(field.key) ? "*" : ""}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    required={requiredFields.includes(field.key)}
                    value={scores[field.key as keyof EvaluationScore] || 0}
                    onChange={(event) =>
                      setScores({
                        ...scores,
                        [field.key]: Number(event.target.value) || 0,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Strengths</Label>
              <Textarea
                value={strengths}
                onChange={(event) => setStrengths(event.target.value)}
                placeholder="Summarize strengths demonstrated by this student."
                rows={3}
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label>Areas for Improvement</Label>
              <Textarea
                value={areasForImprovement}
                onChange={(event) => setAreasForImprovement(event.target.value)}
                placeholder="Specify actionable development areas."
                rows={3}
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label>General Comment</Label>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add any additional comments."
                rows={3}
                maxLength={1000}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Evaluation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
