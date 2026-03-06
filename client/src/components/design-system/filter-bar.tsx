import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  className?: string;
}

export function FilterBar({ children, onApply, onReset, className }: FilterBarProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-3 shadow-sm md:p-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">{children}</div>
        {onApply || onReset ? (
          <div className="flex items-center gap-2">
            {onReset ? (
              <Button variant="outline" size="sm" onClick={onReset}>
                Reset
              </Button>
            ) : null}
            {onApply ? (
              <Button size="sm" onClick={onApply}>
                Apply
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
