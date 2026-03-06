import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DetailPanelProps {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function DetailPanel({ title, meta, children, footer, className }: DetailPanelProps) {
  return (
    <Card className={cn("sticky top-20 shadow-sm", className)}>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-xl">{title}</CardTitle>
        {meta ? <div className="text-sm text-muted-foreground">{meta}</div> : null}
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
        {children}
        {footer ? <div className="border-t pt-4">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
