import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorGlobalStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  retryLabel?: string;
  homeLabel?: string;
}

export function ErrorGlobalState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this page.",
  onRetry,
  onGoHome,
  retryLabel = "Reload",
  homeLabel = "Go Home",
}: ErrorGlobalStateProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 text-center shadow-md md:p-8">
        <div className="mx-auto mb-3 inline-flex rounded-full bg-red-100 p-3 text-red-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {onRetry ? <Button onClick={onRetry}>{retryLabel}</Button> : null}
          {onGoHome ? (
            <Button variant="outline" onClick={onGoHome}>
              {homeLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
