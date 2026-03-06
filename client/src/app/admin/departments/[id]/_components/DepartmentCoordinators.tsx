import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState, LoadingSectionSkeleton } from "@/components/design-system";
import { UserCog, Mail, Phone } from "lucide-react";

export default function DepartmentCoordinators({
  isLoading,
  coordinators,
}: {
  isLoading: boolean;
  coordinators: any[];
}) {
  return (
    <div className="space-y-3">
      {isLoading ? (
        <LoadingSectionSkeleton />
      ) : coordinators.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {coordinators.map((coord: any) => (
            <div
              key={coord.id}
              className="group flex items-center gap-4 rounded-md border border-border bg-background p-4 transition-colors hover:bg-muted/30"
            >
              <Avatar className="h-12 w-12 border border-border">
                <AvatarFallback className="bg-primary/5 font-medium text-primary">
                  {coord.firstName?.[0]}
                  {coord.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-semibold">
                  {coord.firstName} {coord.lastName}
                </p>
                <div className="flex flex-col gap-1">
                  <a
                    href={`mailto:${coord.email}`}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{coord.email}</span>
                  </a>
                  {coord.phone ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {coord.phone}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Coordinators Assigned"
          description="Assign staff from the main departments page to manage placements."
          icon={<UserCog className="h-10 w-10 text-muted-foreground/30" />}
        />
      )}
    </div>
  );
}
