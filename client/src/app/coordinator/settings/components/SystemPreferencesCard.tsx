import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Settings as SettingsIcon } from "lucide-react";

export function SystemPreferencesCard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Coordinator Preferences */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Workflow</CardTitle>
              <CardDescription>Automation preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Auto-approve placements
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically approve if criteria is met.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="shrink-0 rounded-full text-xs"
            >
              Coming Soon
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Auto-assign supervisors
              </Label>
              <p className="text-sm text-muted-foreground">
                Distribute available supervisors automatically.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="shrink-0 rounded-full text-xs"
            >
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Alert and email settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Email notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about student activities.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="shrink-0 rounded-full text-xs"
            >
              Coming Soon
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Placement alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get pinged when students submit applications.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="shrink-0 rounded-full text-xs"
            >
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
