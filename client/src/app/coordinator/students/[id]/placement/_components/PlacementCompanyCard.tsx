import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

export function PlacementCompanyCard({ placement }: { placement: any }) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <CardTitle>Placement Information</CardTitle>
        <CardDescription>Company and training details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <InfoField label="Company Name" value={placement.companyName} />
          <InfoField
            label="Company Sector"
            value={placement.companySector || "N/A"}
          />
          <div className="md:col-span-2">
            <InfoField
              label="Company Address"
              value={placement.companyAddress}
            />
          </div>
          <InfoField
            label="Start Date"
            value={new Date(placement.startDate).toLocaleDateString()}
          />
          <InfoField
            label="End Date"
            value={new Date(placement.endDate).toLocaleDateString()}
          />
        </div>

        {placement.acceptanceLetter && (
          <div className="p-4 border rounded-lg bg-muted/30">
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
        )}
      </CardContent>
    </Card>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </Label>
      <p className="font-medium">{value}</p>
    </div>
  );
}
