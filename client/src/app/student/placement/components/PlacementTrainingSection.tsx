import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/design-system/section";

interface PlacementTrainingSectionProps {
  placement: any;
}

export function PlacementTrainingSection({ placement }: PlacementTrainingSectionProps) {
  return (
    <Section title="Training Period" description="Duration of your industrial training">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <Label className="text-muted-foreground">Start Date</Label>
            <p className="font-medium">
              {new Date(placement.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <Label className="text-muted-foreground">End Date</Label>
            <p className="font-medium">
              {new Date(placement.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
