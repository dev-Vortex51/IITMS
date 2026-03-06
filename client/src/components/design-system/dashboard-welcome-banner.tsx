import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardWelcomeBannerProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function DashboardWelcomeBanner({
  title,
  description,
  action,
  className,
}: DashboardWelcomeBannerProps) {
  return (
    <section
      className={cn(
        "rounded-md border border-l-4 border-border border-l-primary bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
    </section>
  );
}
