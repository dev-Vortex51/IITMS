import { ArrowDown, ArrowUp } from "lucide-react";

interface DashboardMetricItem {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "neutral";
}

interface DashboardMetricsGridProps {
  items: DashboardMetricItem[];
}

export function DashboardMetricsGrid({ items }: DashboardMetricsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-md border border-border bg-card px-5 py-4 shadow-sm"
        >
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{item.value}</p>
          {item.hint ? (
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              {item.trend === "up" ? (
                <ArrowUp className="h-3.5 w-3.5 text-primary" />
              ) : item.trend === "down" ? (
                <ArrowDown className="h-3.5 w-3.5 text-destructive" />
              ) : null}
              {item.hint}
            </p>
          ) : null}
        </article>
      ))}
    </section>
  );
}
