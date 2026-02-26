import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

export function PlacementMetrics({ metrics }: { metrics: any }) {
  const items = [
    {
      label: "Total",
      value: metrics.total,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Approved",
      value: metrics.approved,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending",
      value: metrics.pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Rejected",
      value: metrics.rejected,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Withdrawn",
      value: metrics.withdrawn,
      icon: AlertCircle,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
  ];

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden">
      <CardContent className="p-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 divide-border/50">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="p-5 bg-card/50 flex flex-col justify-center lg:border-r border-border/50 last:border-r-0"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-md ${item.bg} ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
              </div>
              <p className="text-3xl font-bold tracking-tight pl-1">
                {item.value}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
