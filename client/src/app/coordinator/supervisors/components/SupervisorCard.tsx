import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Building2, Mail, Users, Eye } from "lucide-react";
import Link from "next/link";

export function SupervisorCard({
  supervisor,
  type,
}: {
  supervisor: any;
  type: "academic" | "industrial";
}) {
  const isAcademic = type === "academic";
  const Icon = isAcademic ? Building : Building2;
  const iconBg = isAcademic
    ? "bg-blue-50 text-blue-600"
    : "bg-indigo-50 text-indigo-600";

  const entityName = isAcademic
    ? typeof supervisor.department === "object"
      ? supervisor.department.name
      : supervisor.department || "Cross-department"
    : supervisor.companyName || "N/A";

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`p-2.5 rounded-lg shrink-0 ${iconBg}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold truncate">
                {supervisor.name || "N/A"}
              </CardTitle>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground truncate">
                  {supervisor.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <Badge
            variant={supervisor.status === "active" ? "default" : "secondary"}
            className="capitalize"
          >
            {supervisor.status || "Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-2 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground shrink-0">
              {isAcademic ? "Dept:" : "Company:"}
            </span>
            <span className="font-medium truncate">{entityName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground shrink-0">Students:</span>
            <span className="font-medium">
              {supervisor.students?.length || 0} assigned
            </span>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          <Link href={`/coordinator/supervisors/${supervisor.id}`}>
            <Eye className="h-4 w-4 mr-2" /> View Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
