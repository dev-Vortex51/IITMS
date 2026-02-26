import { usePasswordChange } from "../hooks/usePasswordChange";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export function SecurityCard() {
  const { state, setters, handlers, isPending } = usePasswordChange();

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Security Settings</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlers.handleSubmit} className="space-y-5 max-w-xl">
          {state.success && (
            <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm p-3 rounded-lg flex items-center gap-2">
              {state.success}
            </div>
          )}

          {state.error && (
            <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={state.currentPassword}
                onChange={(e) => setters.setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-muted/30"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={state.newPassword}
                  onChange={(e) => setters.setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="bg-muted/30"
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
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
