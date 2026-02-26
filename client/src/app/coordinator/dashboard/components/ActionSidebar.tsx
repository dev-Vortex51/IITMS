import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  UserCheck,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";

export function ActionSidebar({
  stats,
  requiresAction,
}: {
  stats: any;
  requiresAction: boolean;
}) {
  const actions = [
    {
      label: "Manage Students",
      href: "/coordinator/students",
      icon: Users,
      desc: "Directory & profiles",
    },
    {
      label: "Review Placements",
      href: "/coordinator/placements",
      icon: Briefcase,
      desc: "Pending applications",
    },
    {
      label: "Assign Supervisors",
      href: "/coordinator/supervisors",
      icon: UserCheck,
      desc: "Industrial & Academic",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Urgent Alerts Block */}
      {requiresAction && (
        <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center text-amber-900">
              <AlertCircle className="w-4 h-4 mr-2" /> Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingPlacements > 0 && (
              <div className="text-sm text-amber-800">
                <span className="font-bold">{stats.pendingPlacements}</span>{" "}
                placements await your review.
                <Link
                  href="/coordinator/placements"
                  className="ml-2 underline font-medium hover:text-amber-900"
                >
                  Review
                </Link>
              </div>
            )}
            {stats.studentsWithoutSupervisors > 0 && (
              <div className="text-sm text-amber-800 border-t border-amber-200/50 pt-2">
                <span className="font-bold">
                  {stats.studentsWithoutSupervisors}
                </span>{" "}
                students need supervisors.
                <Link
                  href="/coordinator/supervisors"
                  className="ml-2 underline font-medium hover:text-amber-900"
                >
                  Assign
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sleek Quick Actions List */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Quick Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 p-2">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="group flex items-center justify-between p-3 rounded-md hover:bg-muted/60 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background border rounded-md group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.desc}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
