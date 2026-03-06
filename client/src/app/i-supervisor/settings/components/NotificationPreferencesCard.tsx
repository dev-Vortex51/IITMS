import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const notificationRows = [
  {
    title: "Email notifications",
    description: "Receive email updates about student progress",
  },
  {
    title: "Student assignment alerts",
    description: "Get notified when students are assigned to you",
  },
  {
    title: "Assessment reminders",
    description: "Receive reminders for pending assessments",
  },
];

export function NotificationPreferencesCard() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-muted p-2">
            <Bell className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">Manage how you receive notifications</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
          {notificationRows.map((row) => (
            <div key={row.title} className="grid grid-cols-1 gap-3 border-b border-border/60 p-3 last:border-b-0 md:grid-cols-[190px_1fr_auto] md:items-center">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{row.title}</Label>
              <p className="text-sm font-medium text-foreground">{row.description}</p>
              <Button variant="outline" size="sm" disabled className="w-full md:w-auto">
                Coming Soon
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
