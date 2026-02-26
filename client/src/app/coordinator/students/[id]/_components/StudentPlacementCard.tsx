import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Briefcase } from "lucide-react";

interface Props {
  placement: any;
  studentId: string;
  statusText: string;
  statusVariant: any;
}

export function StudentPlacementCard({
  placement,
  studentId,
  statusText,
  statusVariant,
}: Props) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent/20">
              <Briefcase className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Placement Status</CardTitle>
              <CardDescription>Industrial training information</CardDescription>
            </div>
          </div>
          <Badge variant={statusVariant} className="text-sm px-3 py-1">
            {statusText}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!placement ? (
          <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
            <p className="text-muted-foreground text-sm">
              No placement registered yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Company Name
                </Label>
                <p className="font-medium">{placement.companyName || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Company Address
                </Label>
                <p className="font-medium">
                  {placement.companyAddress || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Start Date
                </Label>
                <p className="font-medium">
                  {placement.startDate
                    ? new Date(placement.startDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  End Date
                </Label>
                <p className="font-medium">
                  {placement.endDate
                    ? new Date(placement.endDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <Separator />
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={`/coordinator/students/${studentId}/placement`}>
                View Full Details
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
