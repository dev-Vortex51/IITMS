import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardChartCardProps {
  title: string;
  badge?: string;
  rightAddon?: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardChartCard({
  title,
  badge,
  rightAddon,
  controls,
  children,
  className,
}: DashboardChartCardProps) {
  return (
    <article className={cn("rounded-md border border-border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {rightAddon || (badge ? <span className="text-xs text-muted-foreground">{badge}</span> : null)}
      </div>
      {controls ? <div className="flex items-center justify-between px-5 pt-3">{controls}</div> : null}
      <div className="h-[280px] px-4 pb-4">{children}</div>
    </article>
  );
}
