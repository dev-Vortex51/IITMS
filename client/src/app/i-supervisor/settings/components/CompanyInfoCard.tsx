import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { User as AuthUser } from "@/types/auth";

const infoHint = "Contact admin to update";

interface CompanyInfoCardProps {
  user?: AuthUser | null;
}

export function CompanyInfoCard({ user }: CompanyInfoCardProps) {
  const profile = user?.profileData as any;
  const companyName = profile?.companyName || profile?.industryPartner?.name || "--";
  const position = profile?.position || "--";
  const phone = profile?.phone || user?.phone || "--";
  const companySector = profile?.industryPartner?.sector || "--";
  const companyAddress = profile?.companyAddress || profile?.industryPartner?.address || "--";

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-muted p-2">
            <Building2 className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Company Information</CardTitle>
            <p className="text-sm text-muted-foreground">Organization details linked to your profile</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
          <DetailRow label="Company Name" value={companyName} />
          <DetailRow label="Position / Title" value={position} />
          <DetailRow label="Phone Number" value={phone} />
          <DetailRow label="Company Sector" value={companySector} />
          <DetailRow label="Company Address" value={companyAddress} multiline />
          <DetailRow label="Update Source" value={infoHint} />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border/60 p-3 last:border-b-0 md:grid-cols-[190px_1fr] md:items-start">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <p className={`min-w-0 text-sm font-medium text-foreground ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </p>
    </div>
  );
}
