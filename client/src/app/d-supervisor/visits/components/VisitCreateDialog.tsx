"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { StudentOption, VisitFormState } from "../types";

interface VisitCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentOption[];
  form: VisitFormState;
  setForm: (next: VisitFormState) => void;
  mode?: "create" | "edit";
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function VisitCreateDialog({
  open,
  onOpenChange,
  students,
  form,
  setForm,
  mode = "create",
  onSubmit,
  isSubmitting,
}: VisitCreateDialogProps) {
  const isEditMode = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Supervisor Visit" : "Schedule Supervisor Visit"}
          </DialogTitle>
          <DialogDescription>
            Plan and track physical or virtual student supervision visits.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select
                value={form.student}
                onValueChange={(value) => setForm({ ...form, student: value })}
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
              <Label>Visit Type *</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm({ ...form, type: value as "physical" | "virtual" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Visit Date & Time *</Label>
            <Input
              type="datetime-local"
              value={form.visitDate}
              onChange={(event) => setForm({ ...form, visitDate: event.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Location / Meeting Link</Label>
            <Input
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              placeholder="Office address or virtual meeting link"
              maxLength={300}
            />
          </div>

          <div className="space-y-2">
            <Label>Objective</Label>
            <Textarea
              value={form.objective}
              onChange={(event) => setForm({ ...form, objective: event.target.value })}
              placeholder="What should be covered during this visit?"
              maxLength={1000}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Scheduling..."
                : isEditMode
                  ? "Save Changes"
                  : "Schedule Visit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
