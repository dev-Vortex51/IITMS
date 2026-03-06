import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Briefcase, CalendarDays, Building2, MapPin } from "lucide-react";

interface Props {
  placement: any;
  studentId: string;
  statusText: string;
  status?: string;
}

export function StudentPlacementCard({
  placement,
  studentId,
  statusText,
  status,
}: Props) {
  const getStatusTone = (value?: string) => {
    if (value === "approved") return "bg-emerald-100 text-emerald-800";
    if (value === "pending") return "bg-amber-100 text-amber-800";
    if (value === "rejected") return "bg-rose-100 text-rose-800";
    if (value === "withdrawn") return "bg-slate-200 text-slate-700";
    return "bg-slate-200 text-slate-700";
  };

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent/20">
              <Briefcase className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Placement Status</CardTitle>
              <CardDescription>Industrial training information</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={`text-sm px-3 py-1 ${getStatusTone(status)}`}>
            {statusText}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!placement ? (
          <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
            <p className="text-muted-foreground text-sm">
              No placement registered yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-border/60 overflow-hidden">
              <InfoRow
                label="Company Name"
                value={placement.companyName || "N/A"}
                icon={<Building2 className="h-3.5 w-3.5" />}
              />
              <Separator />
              <InfoRow
                label="Company Address"
                value={placement.companyAddress || "N/A"}
                icon={<MapPin className="h-3.5 w-3.5" />}
              />
              <Separator />
              <InfoRow
                label="Start Date"
                value={
                  placement.startDate
                    ? new Date(placement.startDate).toLocaleDateString()
                    : "N/A"
                }
                icon={<CalendarDays className="h-3.5 w-3.5" />}
              />
              <Separator />
              <InfoRow
                label="End Date"
                value={
                  placement.endDate
                    ? new Date(placement.endDate).toLocaleDateString()
                    : "N/A"
                }
                icon={<CalendarDays className="h-3.5 w-3.5" />}
              />
            </div>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={`/coordinator/students/${studentId}/placement`}>
                View Full Details
              </Link>
            </Button>
          </div>
        )}
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
