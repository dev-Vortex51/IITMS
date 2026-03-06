import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationSettings {
  emailNotifications: boolean;
  checkInReminders: boolean;
  logbookReminders: boolean;
}

interface NotificationPreferencesCardProps {
  notificationSettings: NotificationSettings;
  onToggle: (key: keyof NotificationSettings, value: boolean) => void;
}

export function NotificationPreferencesCard({
  notificationSettings,
  onToggle,
}: NotificationPreferencesCardProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-muted p-2">
            <Bell className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">Configure reminders and updates</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
          <PreferenceRow
            label="Email Notifications"
            description="Receive important updates about your SIWES process."
            checked={notificationSettings.emailNotifications}
            onCheckedChange={(checked) => onToggle("emailNotifications", checked)}
          />
          <PreferenceRow
            label="Check-in Reminders"
            description="Get reminders for daily attendance check-ins."
            checked={notificationSettings.checkInReminders}
            onCheckedChange={(checked) => onToggle("checkInReminders", checked)}
          />
          <PreferenceRow
            label="Logbook Reminders"
            description="Receive reminders to complete weekly logbook entries."
            checked={notificationSettings.logbookReminders}
            onCheckedChange={(checked) => onToggle("logbookReminders", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PreferenceRow({
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
