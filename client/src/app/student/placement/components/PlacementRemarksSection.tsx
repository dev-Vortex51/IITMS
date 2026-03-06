import { Card, CardContent } from "@/components/ui/card";

interface PlacementRemarksSectionProps {
  placement: any;
}

export function PlacementRemarksSection({ placement }: PlacementRemarksSectionProps) {
  if (!placement.reviewComment) return null;

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="pt-6">
        <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">
          Coordinator Remarks
        </h4>
        <p className="text-sm leading-relaxed">{placement.reviewComment}</p>
      </CardContent>
    </Card>
  );
}
