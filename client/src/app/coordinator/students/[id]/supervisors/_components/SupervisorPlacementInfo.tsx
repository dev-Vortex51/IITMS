import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SupervisorPlacementInfo({ placement }: { placement: any }) {
  if (!placement) return null;

  const getStatusTone = (status: string) => {
    if (status === "approved") return "bg-emerald-100 text-emerald-800";
    if (status === "pending") return "bg-amber-100 text-amber-800";
    if (status === "rejected") return "bg-rose-100 text-rose-800";
    if (status === "withdrawn") return "bg-slate-200 text-slate-700";
    return "bg-slate-200 text-slate-700";
  };

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle>Placement Context</CardTitle>
        <CardDescription>
          Supervisor assignment is scoped to this placement.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border border-border/60 overflow-hidden">
          <InfoRow
            label="Company"
            value={placement.companyName || "N/A"}
            icon={<Building2 className="h-3.5 w-3.5" />}
          />
          <Separator />
          <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-[220px_1fr] md:items-center">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Placement Status
            </Label>
            <div>
              <Badge
                variant="secondary"
                className={`capitalize ${getStatusTone(placement.status)}`}
              >
                {placement.status || "pending"}
              </Badge>
            </div>
          </div>
          <Separator />
          <InfoRow
            label="Duration"
            value={`${new Date(placement.startDate).toLocaleDateString()} - ${new Date(placement.endDate).toLocaleDateString()}`}
            icon={<CalendarDays className="h-3.5 w-3.5" />}
          />
        </div>
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
