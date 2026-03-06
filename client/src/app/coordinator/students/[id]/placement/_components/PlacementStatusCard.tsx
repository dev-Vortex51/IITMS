import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, CalendarDays, Building2, UserRound } from "lucide-react";

export function PlacementStatusCard({ placement }: { placement: any }) {
  const statusConfig = {
    approved: {
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      text: "Approved",
      tone: "bg-emerald-100 text-emerald-800",
    },
    pending: {
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
      text: "Pending Review",
      tone: "bg-amber-100 text-amber-800",
    },
    rejected: {
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-100",
      text: "Rejected",
      tone: "bg-rose-100 text-rose-800",
    },
    withdrawn: {
      icon: XCircle,
      color: "text-slate-600",
      bg: "bg-slate-200",
      text: "Withdrawn",
      tone: "bg-slate-200 text-slate-700",
    },
  };

  const config =
    statusConfig[placement.status as keyof typeof statusConfig] ||
    statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-lg ${config.bg}`}>
              <StatusIcon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Placement Review Snapshot</CardTitle>
              <CardDescription>
                Submitted on {new Date(placement.createdAt!).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={`text-sm capitalize ${config.tone}`}>
            {config.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              Student
            </p>
            <p className="mt-1 text-sm font-semibold">
              {placement.student?.name || "Unknown Student"}
            </p>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Company
            </p>
            <p className="mt-1 text-sm font-semibold">{placement.companyName || "N/A"}</p>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Duration
            </p>
            <p className="mt-1 text-sm font-semibold">
              {new Date(placement.startDate).toLocaleDateString()} -{" "}
              {new Date(placement.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
