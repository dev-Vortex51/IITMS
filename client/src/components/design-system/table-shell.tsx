import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TableShellProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function TableShell({ title, actions, children, className }: TableShellProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      {title || actions ? (
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-2">
            {title ? <CardTitle className="text-xl">{title}</CardTitle> : <span />}
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        </CardHeader>
      ) : null}
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
