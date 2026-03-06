import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function TableToolbar({ left, right, className }: TableToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between", className)}>
      <div className="flex flex-wrap items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
