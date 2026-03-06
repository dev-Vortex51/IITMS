import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="space-y-2 p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn("p-4 pt-0 md:p-6 md:pt-0", bodyClassName)}>{children}</CardContent>
    </Card>
  );
}
