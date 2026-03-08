"use client";

import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlacementFormData } from "../types";

interface AcceptanceLetterFieldProps {
  formData: PlacementFormData;
  setFormData: (data: PlacementFormData) => void;
}

export function AcceptanceLetterField({
  formData,
  setFormData,
}: AcceptanceLetterFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="acceptanceLetter">Acceptance Letter (PDF/Image/Word)</Label>
      <Input
        id="acceptanceLetter"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          setFormData({
            ...formData,
            acceptanceLetterFile: file,
            acceptanceLetterName: file ? file.name : formData.acceptanceLetterName,
            removeAcceptanceLetter: false,
          });
        }}
      />

      {formData.acceptanceLetterFile ? (
        <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{formData.acceptanceLetterFile.name}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setFormData({
                ...formData,
                acceptanceLetterFile: null,
                acceptanceLetterName: "",
              })
            }
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        </div>
      ) : formData.acceptanceLetterPath ? (
        <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <a
              href={formData.acceptanceLetterPath}
              target="_blank"
              rel="noreferrer"
              className="truncate text-primary hover:underline"
            >
              {formData.acceptanceLetterName || "Current acceptance letter"}
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setFormData({
                ...formData,
                acceptanceLetterFile: null,
                acceptanceLetterName: "",
                acceptanceLetterPath: "",
                removeAcceptanceLetter: true,
              })
            }
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        </div>
      ) : null}
    </div>
  );
}
