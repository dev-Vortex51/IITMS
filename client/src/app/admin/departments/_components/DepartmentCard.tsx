import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Users, Plus, UserPlus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function DepartmentCard({
  department,
  onAssign,
  onToggleStatus,
  onHardDelete,
  isLoading,
}: any) {
  const hasCoordinators =
    department.coordinators && department.coordinators.length > 0;

  return (
    <Card className="group flex flex-col h-full bg-card hover:shadow-sm hover:border-primary/20 transition-all duration-200">
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {department.code}
            </span>
            <CardTitle className="text-xl tracking-tight leading-none">
              {department.name}
            </CardTitle>
          </div>
          {/* Status Pill */}
          <div
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
              department.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {department.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Metadata List */}
        <div className="space-y-3 text-sm flex-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <School className="h-4 w-4" /> Faculty
            </span>
            <span className="font-medium text-right truncate pl-4">
              {department.faculty?.name || "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Students
            </span>
            <span className="font-medium">{department.studentCount || 0}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Coordinator
            </span>
            {hasCoordinators ? (
              <button
                onClick={() => onAssign(department)}
                className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline text-right"
              >
                {department.coordinators.length === 1
                  ? "Assigned"
                  : `${department.coordinators.length} Assigned`}
              </button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="h-6 text-[11px] px-2.5 rounded-full"
                onClick={() => onAssign(department)}
              >
                <Plus className="h-3 w-3 mr-1" /> Assign
              </Button>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2">
          <Button
            asChild
            variant="default"
            className="flex-1 h-9 text-sm shadow-none"
          >
            <Link href={`/admin/departments/${department.id}`}>
              View Details
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={`h-9 px-3 shadow-none transition-colors ${
              department.isActive
                ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                : "text-emerald-600 border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            }`}
            onClick={() => onToggleStatus(department)}
            disabled={isLoading}
          >
            {department.isActive ? "Deactivate" : "Activate"}
          </Button>

          {!department.isActive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onHardDelete(department)}
              title="Permanently delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
