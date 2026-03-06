import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PreferenceSettings {
  emailNotifications: boolean;
  reviewReminders: boolean;
  assessmentUpdates: boolean;
}

interface PreferenceSettingsCardProps {
  settings: PreferenceSettings;
  onToggle: (key: keyof PreferenceSettings, checked: boolean) => void;
}

export function PreferenceSettingsCard({ settings, onToggle }: PreferenceSettingsCardProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-muted p-2">
            <Bell className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Workflow &amp; Notifications</CardTitle>
            <p className="text-sm text-muted-foreground">Configure review reminders and alert preferences</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
        <Preference
          label="Email notifications"
          description="Receive new logbook and assessment update alerts."
          checked={settings.emailNotifications}
          onCheckedChange={(checked) => onToggle("emailNotifications", checked)}
        />
        <Preference
          label="Review reminders"
          description="Get reminders for pending student logbooks."
          checked={settings.reviewReminders}
          onCheckedChange={(checked) => onToggle("reviewReminders", checked)}
        />
        <Preference
          label="Assessment updates"
          description="Receive updates when assessment statuses change."
          checked={settings.assessmentUpdates}
          onCheckedChange={(checked) => onToggle("assessmentUpdates", checked)}
        />
        </div>
      </CardContent>
    </Card>
  );
}

function Preference({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-border/60 p-3 last:border-b-0 md:grid-cols-[190px_1fr_auto] md:items-center">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <p className="text-sm font-medium text-foreground">{description}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
