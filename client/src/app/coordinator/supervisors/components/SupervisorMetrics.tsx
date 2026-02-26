import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, Building2, CheckCircle2 } from "lucide-react";

export function SupervisorMetrics({ stats }: { stats: any }) {
  const metrics = [
    {
      label: "Total Supervisors",
      value: stats.total,
      icon: Users,
      color: "text-foreground",
    },
    {
      label: "Academic",
      value: stats.academic,
      icon: Building,
      color: "text-blue-600",
    },
    {
      label: "Industrial",
      value: stats.industrial,
      icon: Building2,
      color: "text-indigo-600",
    },
    {
      label: "Active",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
  ];

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden">
      <CardContent className="p-0 flex flex-wrap md:flex-nowrap divide-y md:divide-y-0 md:divide-x divide-border/50">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="flex-1 p-5 bg-card/50 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl bg-muted/50 ${metric.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {metric.value}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
