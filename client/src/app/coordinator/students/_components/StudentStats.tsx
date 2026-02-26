import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, UserCheck, AlertCircle } from "lucide-react";

interface StatsProps {
  stats: {
    total: number;
    withPlacement: number;
    withSupervisors: number;
    noPlacement: number;
  };
}

export function StudentStats({ stats }: StatsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={stats.total}
        icon={<Users className="h-4 w-4 text-primary" />}
      />
      <StatCard
        title="With Placement"
        value={stats.withPlacement}
        icon={<Briefcase className="h-4 w-4 text-green-600" />}
        valueClass="text-green-600"
      />
      <StatCard
        title="With Supervisors"
        value={stats.withSupervisors}
        icon={<UserCheck className="h-4 w-4 text-blue-600" />}
        valueClass="text-blue-600"
      />
      <StatCard
        title="No Placement"
        value={stats.noPlacement}
        icon={<AlertCircle className="h-4 w-4 text-yellow-600" />}
        valueClass="text-yellow-600"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  valueClass = "",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
