import { Card, CardContent } from "@/components/ui/card";

export function InvitationMetrics({ stats }: { stats: any }) {
  const metrics = [
    { label: "Total Sent", value: stats.total, color: "text-foreground" },
    { label: "Pending", value: stats.pending, color: "text-amber-600" },
    { label: "Accepted", value: stats.accepted, color: "text-emerald-600" },
    { label: "Expired", value: stats.expired, color: "text-rose-600" },
    {
      label: "Cancelled",
      value: stats.cancelled,
      color: "text-muted-foreground",
    },
  ];

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden">
      <CardContent className="p-0 flex flex-wrap md:flex-nowrap divide-y md:divide-y-0 md:divide-x divide-border/50">
        {metrics.map((metric, i) => (
          <div key={i} className="flex-1 p-5 bg-card/50">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {metric.label}
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${metric.color}`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
