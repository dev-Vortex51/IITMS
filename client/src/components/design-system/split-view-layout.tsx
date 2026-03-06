import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SplitViewLayoutProps {
  list: ReactNode;
  detail: ReactNode;
  className?: string;
}

export function SplitViewLayout({ list, detail, className }: SplitViewLayoutProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6", className)}>
      <div className="min-w-0">{list}</div>
      <div className="min-w-0">{detail}</div>
    </div>
  );
}
