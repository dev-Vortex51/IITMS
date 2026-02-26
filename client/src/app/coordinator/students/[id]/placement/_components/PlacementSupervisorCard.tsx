import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";

export function PlacementSupervisorCard({ placement }: { placement: any }) {
  if (!placement.supervisorName && !placement.supervisorEmail) return null;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Industrial Supervisor</CardTitle>
            <CardDescription>
              Student&apos;s supervisor at the placement organization
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SupervisorField
            icon={<User className="h-4 w-4" />}
            label="Name"
            value={placement.supervisorName}
          />
          <SupervisorField
            label="Position"
            value={placement.supervisorPosition}
          />
          <SupervisorField
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={placement.supervisorEmail}
          />
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
    <div className="space-y-1">
      <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
        {icon} {label}
      </Label>
      <p className="font-medium truncate" title={value || "N/A"}>
        {value || "N/A"}
      </p>
    </div>
  );
}
