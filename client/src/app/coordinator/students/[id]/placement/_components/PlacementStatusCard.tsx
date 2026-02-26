import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export function PlacementStatusCard({ placement }: { placement: any }) {
  const statusConfig = {
    approved: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "Approved",
      variant: "success" as const,
    },
    pending: {
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "Pending Review",
      variant: "warning" as const,
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "Rejected",
      variant: "destructive" as const,
    },
  };

  const config =
    statusConfig[placement.status as keyof typeof statusConfig] ||
    statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${config.bg}`}>
              <StatusIcon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">Placement Status</CardTitle>
              <CardDescription>
                Submitted on{" "}
                {new Date(placement.createdAt!).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <Badge variant={config.variant} className="text-sm px-3 py-1">
            {config.text}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
