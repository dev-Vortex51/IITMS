import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/design-system/empty-state";

interface LogbookEmptyStateProps {
  onCreate: () => void;
}

export function LogbookEmptyState({ onCreate }: LogbookEmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <EmptyState
          title="No Entries Yet"
          description="Start documenting your weekly training activities"
          icon={<BookOpen className="h-6 w-6 text-accent-foreground" />}
        />
        <div className="flex justify-center">
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
