import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserCog, Mail, Phone } from "lucide-react";

export default function DepartmentCoordinators({
  isLoading,
  coordinators,
}: {
  isLoading: boolean;
  coordinators: any[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 pb-4 border-b border-border/40">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <UserCog className="h-5 w-5 text-muted-foreground" />
          Assigned Coordinators
        </h2>
        <p className="text-sm text-muted-foreground">
          Primary staff contacts managing internships and placements.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : coordinators.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {coordinators.map((coord: any) => (
            <div
              key={coord.id}
              className="group flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:border-primary/20 hover:shadow-sm transition-all"
            >
              <Avatar className="h-12 w-12 border border-border">
                <AvatarFallback className="bg-primary/5 text-primary font-medium">
                  {coord.firstName?.[0]}
                  {coord.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">
                  {coord.firstName} {coord.lastName}
                </p>
                <div className="flex flex-col gap-1">
                  <a
                    href={`mailto:${coord.email}`}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="h-3 w-3" />{" "}
                    <span className="truncate">{coord.email}</span>
                  </a>
                  {coord.phone && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {coord.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-transparent shadow-none py-12 flex flex-col items-center justify-center text-center px-4">
          <UserCog className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            No Coordinators Assigned
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
            Assign staff from the main departments page to manage placements.
          </p>
        </Card>
      )}
    </div>
  );
}
