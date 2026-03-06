import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Settings as SettingsIcon } from "lucide-react";

export function SystemPreferencesCard() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-muted p-2">
            <SettingsIcon className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Workflow &amp; Notifications</CardTitle>
            <p className="text-sm text-muted-foreground">Automation and alert preferences</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
          <PreferenceRow
            label="Auto-approve placements"
            description="Automatically approve placement requests when criteria are met."
          />
          <PreferenceRow
            label="Auto-assign supervisors"
            description="Distribute available supervisors automatically after approvals."
          />
          <PreferenceRow
            label="Email notifications"
            description="Receive updates about student and placement activities."
            icon={<Bell className="h-4 w-4 text-muted-foreground" />}
          />
          <PreferenceRow
            label="Placement alerts"
            description="Get alerted when students submit new placement requests."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PreferenceRow({
  label,
  description,
  icon,
}: {
  label: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-border/60 p-3 last:border-b-0 md:grid-cols-[190px_1fr_auto] md:items-center">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-medium text-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm" disabled className="w-full md:w-auto">
        Coming Soon
      </Button>
    </div>
  );
}
