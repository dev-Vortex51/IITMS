import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardQuickActionItem {
  label: string;
  href: string;
  description?: string;
  icon: LucideIcon;
}

interface DashboardQuickActionsProps {
  title?: string;
  items: DashboardQuickActionItem[];
  limit?: number;
  primaryAction?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
  moreLink?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function DashboardQuickActions({
  title = "Quick Actions",
  items,
  limit,
  primaryAction,
  moreLink,
  className,
}: DashboardQuickActionsProps) {
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <section className={cn("rounded-md border border-border bg-card shadow-sm", className)}>
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4">
        {primaryAction ? (
          <Button asChild className="h-11 justify-start gap-2">
            <Link href={primaryAction.href}>
              {primaryAction.icon ? (
                <primaryAction.icon className="h-4 w-4" />
              ) : null}
              {primaryAction.label}
            </Link>
          </Button>
        ) : null}

        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              asChild
              variant="outline"
              className="h-auto min-h-11 justify-start gap-3 border-border px-3 py-3 text-foreground"
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-left">
                  <span className="block text-sm font-medium">{item.label}</span>
                  {item.description ? (
                    <span className="block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </Button>
          );
        })}

        {moreLink ? (
          <Link
            href={moreLink.href}
            className="inline-flex items-center gap-1 px-1 text-xs font-medium text-primary hover:underline"
          >
            {moreLink.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
