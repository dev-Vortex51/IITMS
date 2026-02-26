import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function SupervisorPlacementInfo({ placement }: { placement: any }) {
  if (!placement) return null;

  return (
    <Card className="shadow-sm border-border/50 bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
          Placement Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Company
            </Label>
            <p className="font-medium mt-0.5">{placement.companyName}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Status
            </Label>
            <div className="mt-1">
              <Badge
                variant={
                  placement.status === "approved" ? "success" : "warning"
                }
              >
                {placement.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
