import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormActionsBarProps {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function FormActionsBar({ left, right, className }: FormActionsBarProps) {
  return (
    <div className={cn("flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center justify-end gap-2">{right}</div>
    </div>
  );
}
