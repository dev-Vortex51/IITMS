import { Loader2 } from "lucide-react";

interface LoadingPageProps {
  label?: string;
}

export function LoadingPage({ label = "Loading..." }: LoadingPageProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-3 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
