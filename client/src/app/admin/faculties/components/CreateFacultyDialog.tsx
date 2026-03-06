import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorLocalState } from "@/components/design-system";

interface CreateFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: { name: string; code: string; dean: string };
  onFormDataChange: (data: { name: string; code: string; dean: string }) => void;
  onSubmit: (event: React.FormEvent) => void;
  isCreating: boolean;
  formError: string;
  onCancel: () => void;
}

export function CreateFacultyDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isCreating,
  formError,
  onCancel,
}: CreateFacultyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Faculty
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Faculty</DialogTitle>
          <DialogDescription>Add a new faculty to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Faculty Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(event) => onFormDataChange({ ...formData, name: event.target.value })}
              required
              placeholder="e.g., Faculty of Science"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Faculty Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(event) => onFormDataChange({ ...formData, code: event.target.value })}
              required
              placeholder="e.g., SCI"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dean">Dean Name</Label>
            <Input
              id="dean"
              value={formData.dean}
              onChange={(event) => onFormDataChange({ ...formData, dean: event.target.value })}
              placeholder="e.g., Prof. Jane Doe"
            />
          </div>
          {formError ? <ErrorLocalState message={formError} /> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Faculty"}
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
