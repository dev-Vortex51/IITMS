import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      {icon ? <div className="p-4 rounded-full bg-accent/10 mb-4">{icon}</div> : null}
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
