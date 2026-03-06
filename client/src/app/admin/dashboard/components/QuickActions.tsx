import Link from "next/link";
import { ArrowUpRight, Building, Plus, School, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, SectionCard } from "@/components/design-system";

export function QuickActions() {
  const actions = [
    {
      title: "Create Faculty",
      description: "Add new faculty",
      href: "/admin/faculties",
      actionLabel: "New Faculty",
      icon: School,
    },
    {
      title: "Create Department",
      description: "Add new department",
      href: "/admin/departments",
      actionLabel: "New Department",
      icon: Building,
    },
    {
      title: "Manage Coordinators",
      description: "Assign roles and access",
      href: "/admin/coordinators",
      actionLabel: "View Coordinators",
      icon: UserCog,
    },
  ];

  return (
    <SectionCard
      title="Quick Navigation"
      description="Fast access to high-frequency admin tasks."
    >
      {actions.length ? (
        <div className="space-y-2">
          {actions.map((action, index) => (
            <div
              key={action.href}
              className="rounded-lg border bg-background p-3 transition-colors hover:bg-muted/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-md border p-2">
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
           <div className="mt-3">
                <Button
                  asChild
                  className="w-full"
                  // FIX: Only the first action gets the primary "default" style.
                  variant={index === 0 ? "default" : "outline"}
                >
                  <Link href={action.href}>
                    <Plus className="mr-2 h-4 w-4" />
                    {action.actionLabel}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No quick actions"
          description="Actions will appear here when available."
        />
      )}
    </SectionCard>
  );
}
