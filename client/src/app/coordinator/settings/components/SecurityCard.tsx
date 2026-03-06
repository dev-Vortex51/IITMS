import { usePasswordChange } from "../hooks/usePasswordChange";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SecurityCard() {
  const { state, setters, handlers, isPending } = usePasswordChange();
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
              <form onSubmit={handlers.handleSubmit} className="space-y-5">
                {state.success ? (
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm p-3 rounded-md">
                    {state.success}
                  </div>
                ) : null}

                {state.error ? (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    {state.error}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={state.currentPassword}
                    onChange={(e) => setters.setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={state.newPassword}
                    onChange={(e) => setters.setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={state.confirmPassword}
                    onChange={(e) => setters.setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                    {isPending ? "Updating Password..." : "Update Password"}
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
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
            <p className="text-sm font-medium text-foreground">
              Password updates are handled in a secure dialog to reduce accidental edits.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[190px_1fr] md:items-center">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Password Rules</Label>
            <p className="text-sm font-medium text-foreground">Minimum 8 characters, confirmation required.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
