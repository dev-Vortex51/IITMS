import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { Department, InvitationFormData } from "../types";

interface InvitationCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: InvitationFormData;
  onFormChange: (next: InvitationFormData) => void;
  departments: Department[];
  onSubmit: () => void;
  isCreating: boolean;
}

export function InvitationCreateDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  departments,
  onSubmit,
  isCreating,
}: InvitationCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
          <DialogDescription>
            Invite a new user to join the system. They will receive a magic link to
            complete their setup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address *</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(event) => onFormChange({ ...formData, email: event.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => onFormChange({ ...formData, role: value })}
            >
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="academic_supervisor">Academic Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "coordinator" ? (
            <div className="space-y-2">
              <Label htmlFor="invite-department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => onFormChange({ ...formData, department: value })}
              >
                <SelectTrigger id="invite-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name} ({department.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isCreating}>
            {isCreating ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
