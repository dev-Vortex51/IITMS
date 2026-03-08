"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ComplianceFormType, ComplianceTemplateItem } from "../types";

interface ComplianceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ComplianceTemplateItem[];
  selectedType: ComplianceFormType | "";
  setSelectedType: (value: ComplianceFormType | "") => void;
  title: string;
  setTitle: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  documentFile: File | null;
  setDocumentFile: (file: File | null) => void;
  editing: boolean;
  onSave: () => void;
  isSaving: boolean;
}

export function ComplianceFormDialog({
  open,
  onOpenChange,
  template,
  selectedType,
  setSelectedType,
  title,
  setTitle,
  note,
  setNote,
  documentFile,
  setDocumentFile,
  editing,
  onSave,
  isSaving,
}: ComplianceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Update Compliance Form" : "New Compliance Form"}</DialogTitle>
          <DialogDescription>Register and track SIWES compliance forms for your record.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Form Type *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as ComplianceFormType)}
              disabled={editing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select compliance form" />
              </SelectTrigger>
              <SelectContent>
                {template.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Optional form title"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional submission note"
              maxLength={2000}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Document</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
              {isSaving ? "Saving..." : editing ? "Save Changes" : "Save Form"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
