import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, CheckCircle } from "lucide-react";

export function SupervisorMetrics({ metrics }: { metrics: any }) {
  const items = [
    {
      label: "Assigned Students",
      value: metrics.students,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Pending Reviews",
      value: metrics.pendingReviews,
      icon: FileText,
      color: "text-amber-600",
    },
    {
      label: "Completed",
      value: metrics.completedAssessments,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
  ];

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden">
      <CardContent className="p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex-1 p-5 bg-card/50 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl bg-muted/50 ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
