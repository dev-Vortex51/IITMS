import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { LoadingCard } from "@/components/ui/loading";

const getStatusConfig = (status: string) => {
  const configs: Record<string, any> = {
    approved: {
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      variant: "success",
      text: "Approved",
    },
    pending: {
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      variant: "warning",
      text: "Pending",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      variant: "destructive",
      text: "Rejected",
    },
    withdrawn: {
      icon: XCircle,
      color: "text-slate-600",
      bg: "bg-slate-100",
      variant: "secondary",
      text: "Withdrawn",
    },
  };
  return configs[status] || configs.pending;
};

export function PlacementList({
  placements,
  isLoading,
}: {
  placements: any[];
  isLoading: boolean;
}) {
  if (isLoading) return <LoadingCard />;

  if (placements.length === 0) {
    return (
      <Card className="border-dashed border-border/60 shadow-none">
        <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Briefcase className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <h3 className="font-medium text-lg">No placements found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search filters or wait for new applications to be
            submitted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {placements.map((placement: any) => {
        const config = getStatusConfig(placement.status);
        const StatusIcon = config.icon;

        return (
          <div
            key={placement.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border border-border/50 rounded-xl bg-card hover:bg-muted/30 transition-colors gap-4 shadow-sm"
          >
            {/* Left/Top Content - IMPORTANT: min-w-0 prevents mobile blowout */}
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${config.bg}`}>
                <Briefcase className={`h-5 w-5 ${config.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="font-semibold text-foreground truncate">
                    {placement.student?.name || "Unknown Student"}
                  </p>
                  <span className="text-muted-foreground text-xs font-medium px-1.5 py-0.5 rounded-md bg-muted/50">
                    {placement.student?.matricNumber || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground min-w-0">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Building className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{placement.companyName}</span>
                  </span>
                  <span className="hidden sm:inline text-muted-foreground/30">
                    •
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(placement.startDate).toLocaleDateString()} -{" "}
                    {new Date(placement.endDate).toLocaleDateString()}
                  </span>
                </div>

                {placement.coordinator_remarks && (
                  <p className="text-xs text-muted-foreground mt-2.5 border-l-2 border-border/50 pl-2 py-0.5 truncate">
                    <span className="font-medium">Remark:</span>{" "}
                    {placement.coordinator_remarks}
                  </p>
                )}
              </div>
            </div>

            {/* Right/Bottom Content - Actions & Badges */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t border-border/50 sm:border-0 mt-2 sm:mt-0">
              <Badge variant={config.variant} className="gap-1.5 px-2.5 py-0.5">
                <StatusIcon className="h-3 w-3" />
                {config.text}
              </Badge>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Link
                  href={`/coordinator/students/${placement.student?.id}/placement`}
                >
                  Review Details
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
