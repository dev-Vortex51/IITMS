"use client";

import { AssessmentScore, Student } from "../types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AssessmentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  selectedStudent: string;
  setSelectedStudent: (value: string) => void;
  assessmentType: "midterm" | "final";
  setAssessmentType: (value: "midterm" | "final") => void;
  scores: AssessmentScore;
  setScores: (scores: AssessmentScore) => void;
  strengths: string;
  setStrengths: (value: string) => void;
  areasForImprovement: string;
  setAreasForImprovement: (value: string) => void;
  comment: string;
  setComment: (value: string) => void;
  recommendation: "excellent" | "very_good" | "good" | "fair" | "poor";
  setRecommendation: (value: "excellent" | "very_good" | "good" | "fair" | "poor") => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const scoreFields = [
  { key: "technical", label: "Technical Skills" },
  { key: "communication", label: "Communication" },
  { key: "punctuality", label: "Punctuality" },
  { key: "initiative", label: "Initiative" },
  { key: "teamwork", label: "Teamwork" },
  { key: "professionalism", label: "Professionalism" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "adaptability", label: "Adaptability" },
];

const requiredScoreFields = [
  "technical",
  "communication",
  "punctuality",
  "initiative",
  "teamwork",
];

export function AssessmentCreateDialog({
  open,
  onOpenChange,
  students,
  selectedStudent,
  setSelectedStudent,
  assessmentType,
  setAssessmentType,
  scores,
  setScores,
  strengths,
  setStrengths,
  areasForImprovement,
  setAreasForImprovement,
  comment,
  setComment,
  recommendation,
  setRecommendation,
  onSubmit,
  isSubmitting,
}: AssessmentCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Student Assessment</DialogTitle>
          <DialogDescription>
            Evaluate student performance across multiple criteria
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
              <Label htmlFor="student">Student *</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.user?.firstName} {student.user?.lastName} (
                      {student.matricNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Assessment Type *</Label>
              <Select
                value={assessmentType}
                onValueChange={(value) => setAssessmentType(value as "midterm" | "final")}
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
            <h3 className="text-lg font-semibold">Performance Scores (0-100)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {scoreFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label} {requiredScoreFields.includes(field.key) && "*"}
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    min="0"
                    max="100"
                    value={scores[field.key as keyof AssessmentScore]}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        [field.key]: parseInt(e.target.value) || 0,
                      })
                    }
                    required={requiredScoreFields.includes(field.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strengths">Strengths</Label>
              <Textarea
                id="strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Describe the student's key strengths..."
                rows={3}
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="improvements">Areas for Improvement</Label>
              <Textarea
                id="improvements"
                value={areasForImprovement}
                onChange={(e) => setAreasForImprovement(e.target.value)}
                placeholder="Identify areas where the student can improve..."
                rows={3}
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">General Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Additional comments or observations..."
                rows={3}
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendation">Overall Recommendation *</Label>
              <Select
                value={recommendation}
                onValueChange={(value) =>
                  setRecommendation(
                    value as "excellent" | "very_good" | "good" | "fair" | "poor",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="very_good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Assessment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
