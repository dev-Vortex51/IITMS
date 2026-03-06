import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorLocalStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function ErrorLocalState({
  title = "Unable to load data",
  message,
  onRetry,
  retryLabel = "Try Again",
  icon,
  className,
}: ErrorLocalStateProps) {
  return (
    <div className={cn("rounded-lg border border-red-200 bg-red-50 p-4 text-red-800", className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon || <AlertCircle className="h-4 w-4" />}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm">{message}</p>
          {onRetry ? (
            <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
