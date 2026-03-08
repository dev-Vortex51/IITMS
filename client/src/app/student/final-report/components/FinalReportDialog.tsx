"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FinalReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  setTitle: (value: string) => void;
  abstractText: string;
  setAbstractText: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  documentFile: File | null;
  setDocumentFile: (file: File | null) => void;
  editing: boolean;
  onSave: () => void;
  isSaving: boolean;
}

export function FinalReportDialog({
  open,
  onOpenChange,
  title,
  setTitle,
  abstractText,
  setAbstractText,
  note,
  setNote,
  documentFile,
  setDocumentFile,
  editing,
  onSave,
  isSaving,
}: FinalReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Update Final Technical Report" : "Final Technical Report"}</DialogTitle>
          <DialogDescription>Upload your final SIWES technical report for departmental review.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Final report title"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Abstract</Label>
            <Textarea
              value={abstractText}
              onChange={(event) => setAbstractText(event.target.value)}
              placeholder="Summary of your work, methods, and outcomes"
              rows={5}
              maxLength={5000}
            />
          </div>

          <div className="space-y-2">
            <Label>Submission Note</Label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note for reviewer"
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label>Report Document (PDF/DOC/DOCX)</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
            />
            {documentFile ? (
              <p className="text-xs text-muted-foreground truncate">Selected: {documentFile.name}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editing ? "Save Changes" : "Save Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
