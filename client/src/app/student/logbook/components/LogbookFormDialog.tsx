import type { ChangeEvent, FormEvent } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LogbookEntry } from "@/services/logbook.service";
import type { LogbookFormState } from "../types";

interface LogbookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  formData: LogbookFormState;
  setFormData: (data: LogbookFormState) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  editingEntry: LogbookEntry | null;
  activeWeekContext: {
    weekNumber: number;
    startDate: string;
    endDate: string;
    isReady: boolean;
    lockReason: string;
  } | null;
  isSaving: boolean;
  error?: string;
}

export function LogbookFormDialog({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  formData,
  setFormData,
  selectedFiles,
  setSelectedFiles,
  editingEntry,
  activeWeekContext,
  isSaving,
  error,
}: LogbookFormDialogProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Edit Logbook Entry" : "Create Logbook Entry"}
          </DialogTitle>
          <DialogDescription>
            Document your activities and learning for the week
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tasksPerformed">Tasks Performed *</Label>
            <Textarea
              id="tasksPerformed"
              className="min-h-[120px]"
              value={formData.tasksPerformed}
              onChange={(event) =>
                setFormData({ ...formData, tasksPerformed: event.target.value })
              }
              required
              placeholder="Describe the tasks and activities you performed this week..."
              minLength={10}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.tasksPerformed.length}/2000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillsAcquired">Skills Acquired</Label>
            <Textarea
              id="skillsAcquired"
              className="min-h-[80px]"
              value={formData.skillsAcquired}
              onChange={(event) =>
                setFormData({ ...formData, skillsAcquired: event.target.value })
              }
              placeholder="What new skills or knowledge did you gain?"
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">Challenges</Label>
            <Textarea
              id="challenges"
              className="min-h-[80px]"
              value={formData.challenges}
              onChange={(event) =>
                setFormData({ ...formData, challenges: event.target.value })
              }
              placeholder="What challenges did you face this week?"
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonsLearned">Lessons Learned</Label>
            <Textarea
              id="lessonsLearned"
              className="min-h-[80px]"
              value={formData.lessonsLearned}
              onChange={(event) =>
                setFormData({ ...formData, lessonsLearned: event.target.value })
              }
              placeholder="What lessons did you learn from this week?"
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence (Images/Documents)</Label>
            <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
              <Input
                id="evidence"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="evidence"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images or documents
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: Images, PDF, Word documents
                </p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-sm font-medium">Selected files:</p>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={file.name + index}
                      className="flex items-center justify-between bg-muted p-2 rounded text-sm"
                    >
                      <span className="truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFiles(
                            selectedFiles.filter((_, i) => i !== index),
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error ? (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : editingEntry
                ? "Update Entry"
                : "Save Draft"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
