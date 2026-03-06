import { CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { User as AuthUser } from "@/types/auth";

interface ProfileInfoCardProps {
  user?: AuthUser | null;
}

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    "N/A";
  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "IS";
  const accountCreated = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";
  const role = String(user?.role || "industrial_supervisor").replaceAll("_", " ").toUpperCase();

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Supervisor Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border border-border">
            <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{fullName}</p>
            <p className="text-xs text-muted-foreground">Industrial Supervisor</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border/60">
          <DetailRow label="Full Name" value={fullName} />
          <DetailRow
            label="Email Address"
            value={user?.email || "N/A"}
            addon={
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </span>
            }
          />
          <DetailRow label="Role" value={role} />
          <DetailRow label="Account Created" value={accountCreated} />
          <DetailRow
            label="Profile Summary"
            value={`Account created on ${accountCreated}. This profile handles industrial supervision and attendance oversight.`}
            multiline
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  addon,
  multiline = false,
}: {
  label: string;
  value: string;
  addon?: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border/60 p-3 last:border-b-0 md:grid-cols-[190px_1fr] md:items-start">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <p className={`min-w-0 text-sm font-medium text-foreground ${multiline ? "whitespace-pre-wrap" : ""}`}>
          {value}
        </p>
        {addon}
      </div>
    </div>
  );
}
