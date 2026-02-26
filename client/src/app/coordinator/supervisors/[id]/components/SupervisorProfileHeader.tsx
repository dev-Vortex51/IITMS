import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function SupervisorProfileHeader({ supervisor, isDepartmental }: any) {
  const isActive = supervisor.isActive !== false;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex items-center gap-4 min-w-0">
        <Button variant="outline" size="icon" asChild className="shrink-0">
          <Link href="/coordinator/supervisors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            {supervisor.name || "Supervisor Profile"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isDepartmental ? "Academic / Departmental" : "Industrial"} Partner
          </p>
        </div>
      </div>
      <Badge
        variant={isActive ? "default" : "secondary"}
        className="w-fit self-start sm:self-auto"
      >
        {isActive ? "Active Account" : "Inactive"}
      </Badge>
    </div>
  );
}
