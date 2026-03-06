import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function PlacementSupervisorCard({ placement }: { placement: any }) {
  if (!placement.supervisorName && !placement.supervisorEmail) return null;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Industrial Supervisor</CardTitle>
            <CardDescription>
              Student&apos;s supervisor at the placement organization
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border border-border/60 overflow-hidden">
          <SupervisorField
            icon={<User className="h-4 w-4" />}
            label="Name"
            value={placement.supervisorName}
          />
          <Separator />
          <SupervisorField
            label="Position"
            value={placement.supervisorPosition}
          />
          <Separator />
          <SupervisorField
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={placement.supervisorEmail}
          />
          <Separator />
          <SupervisorField
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={placement.supervisorPhone}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SupervisorField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[220px_1fr] md:items-center">
      <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
        {icon} {label}
      </Label>
      <p className="font-medium text-sm truncate" title={value || "N/A"}>
        {value || "N/A"}
      </p>
    </div>
  );
}
