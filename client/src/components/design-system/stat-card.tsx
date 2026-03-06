import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, icon, className }: StatCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="space-y-2 p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          {icon ? <div className="text-muted-foreground">{icon}</div> : null}
        </div>
        <p className="text-2xl font-semibold leading-none">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
