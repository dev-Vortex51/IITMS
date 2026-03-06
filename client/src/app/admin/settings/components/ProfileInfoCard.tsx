import { CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ProfileInfoCardProps {
  user: any;
}

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || "N/A";

  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "AU";

  const accountCreated = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "N/A";

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 border border-border">
              <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{fullName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || "Admin"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border/60 overflow-hidden">
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
          <DetailRow label="Username" value={(user?.email || "").split("@")[0] || "N/A"} />
          <DetailRow
            label="Role"
            value={user?.role ? String(user.role).replaceAll("_", " ").toUpperCase() : "N/A"}
          />
          <DetailRow
            label="Profile Summary"
            value={`Account created on ${accountCreated}. This administrator profile manages core SIWES configuration.`}
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
