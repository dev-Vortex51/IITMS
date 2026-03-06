import { Badge } from "@/components/ui/badge";
import { Building, Building2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SupervisorProfileHeader({ supervisor, isDepartmental }: any) {
  const isActive = supervisor.isActive !== false;
  const Icon = isDepartmental ? Building : Building2;
  const scopeValue = isDepartmental
    ? supervisor?.department?.name || "No department linked"
    : supervisor?.companyName || "No company linked";

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b border-border/60 bg-muted/20 px-4 py-3 md:px-5 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-full bg-background border border-border/60 p-2.5">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold text-foreground truncate">
                  {supervisor.name || "Supervisor Profile"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isDepartmental ? "Academic / Departmental" : "Industrial"} Supervisor
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}
            >
              {isActive ? "Active Account" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="px-4 py-4 md:px-5 md:py-5">
          <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-1.5">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{scopeValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
