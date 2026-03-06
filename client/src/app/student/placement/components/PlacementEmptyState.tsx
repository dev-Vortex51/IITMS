import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/design-system/empty-state";
import { Button } from "@/components/ui/button";

interface PlacementEmptyStateProps {
  onStartNew: () => void;
}

export function PlacementEmptyState({ onStartNew }: PlacementEmptyStateProps) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="pt-8 pb-8">
        <EmptyState
          title="No Placement Submitted"
          description="You haven't submitted your industrial training placement details yet."
          icon={<FileText className="h-12 w-12 text-muted-foreground" />}
        />
        <div className="mt-4 flex justify-center">
          <Button onClick={onStartNew}>Submit Placement</Button>
        </div>
      </CardContent>
    </Card>
  );
}
