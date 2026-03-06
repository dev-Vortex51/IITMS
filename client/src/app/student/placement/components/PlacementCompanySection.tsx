import {
  Building2,
  BriefcaseBusiness,
  Calendar,
  FileText,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface PlacementCompanySectionProps {
  placement: any;
}

export function PlacementCompanySection({ placement }: PlacementCompanySectionProps) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Placement Information</CardTitle>
        <CardDescription>Company and training details</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-1 rounded-md border border-border/60 overflow-hidden">
          <InfoRow
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="Company Name"
            value={placement.companyName || "N/A"}
          />
          <Separator />
          <InfoRow
            icon={<BriefcaseBusiness className="h-3.5 w-3.5" />}
            label="Company Sector"
            value={placement.companySector || "N/A"}
          />
          <Separator />
          <InfoRow
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Company Address"
            value={placement.companyAddress || "N/A"}
          />
          <Separator />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Start Date"
            value={new Date(placement.startDate).toLocaleDateString()}
          />
          <Separator />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="End Date"
            value={new Date(placement.endDate).toLocaleDateString()}
          />
        </div>

        {placement.acceptanceLetter ? (
          <div className="p-4 border rounded-lg bg-muted/30 mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded border shadow-sm">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Acceptance Letter
                </Label>
                <p className="font-medium text-sm mt-0.5">Document uploaded</p>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InfoRow({
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
      <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}
