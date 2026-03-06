import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { ErrorLocalState } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ChangePasswordCardProps {
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  onPasswordDataChange: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
  error: string;
  isChangingPassword: boolean;
  onSubmit: (event: FormEvent) => void;
}

export function ChangePasswordCard({
  passwordData,
  onPasswordDataChange,
  error,
  isChangingPassword,
  onSubmit,
}: ChangePasswordCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg border border-border bg-muted p-2">
              <Lock className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base">Security</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your account password</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Update Password</Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-1rem)] max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                  Enter your current password and choose a new secure password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-current-password">Current Password</Label>
                  <Input
                    id="admin-current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(event) =>
                      onPasswordDataChange({
                        ...passwordData,
                        currentPassword: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-new-password">New Password</Label>
                  <Input
                    id="admin-new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(event) =>
                      onPasswordDataChange({
                        ...passwordData,
                        newPassword: event.target.value,
                      })
                    }
                    required
                    minLength={8}
                  />
                  <p className="text-sm text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-confirm-password">Confirm New Password</Label>
                  <Input
                    id="admin-confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(event) =>
                      onPasswordDataChange({
                        ...passwordData,
                        confirmPassword: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                {error ? <ErrorLocalState message={error} /> : null}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isChangingPassword} className="w-full sm:w-auto">
                    {isChangingPassword ? "Changing Password..." : "Change Password"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
          <div className="grid grid-cols-1 gap-1 border-b border-border/60 p-3 md:grid-cols-[190px_1fr] md:items-center">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <p className="text-sm font-medium text-foreground">
              Password changes are handled in a secure dialog to reduce accidental edits.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[190px_1fr] md:items-center">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Password Rules
            </Label>
            <p className="text-sm font-medium text-foreground">Minimum 8 characters, confirmation required.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
