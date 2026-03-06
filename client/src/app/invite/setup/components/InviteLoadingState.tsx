import { Loader2 } from "lucide-react";

export function InviteLoadingState() {
  return (
    <div className="rounded-md border border-border bg-card p-8 text-center shadow-sm">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      <p className="mt-3 text-sm text-muted-foreground">Loading invitation details...</p>
    </div>
  );
}
