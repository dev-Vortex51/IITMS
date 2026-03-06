import { Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/design-system";
import type { Logbook } from "../types";
import { getLogbookId, getStatusBadge } from "../utils/logbook-ui";

interface StudentLogbooksListProps {
  logbooks: Logbook[];
  onReview: (logbook: Logbook) => void;
}

export function StudentLogbooksList({
  logbooks,
  onReview,
}: StudentLogbooksListProps) {
  if (!logbooks.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <EmptyState
            title="No logbooks found"
            description="Try a different filter for this student."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logbooks.map((logbook) => (
        <Card key={getLogbookId(logbook)}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Week {logbook.weekNumber}</CardTitle>
                <CardDescription>
                  {new Date(logbook.startDate).toLocaleDateString()} -{" "}
                  {new Date(logbook.endDate).toLocaleDateString()}
                </CardDescription>
              </div>

              <div className="flex gap-2">
                {getStatusBadge(logbook.industrialReview?.status)}
                <Button variant="outline" size="sm" onClick={() => onReview(logbook)}>
                  <Eye className="mr-2 h-4 w-4" />
                  {logbook.industrialReview?.status === "submitted" ? "Review" : "View"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Tasks Performed</Label>
                <p className="mt-1 text-sm text-muted-foreground">{logbook.tasksPerformed}</p>
              </div>

              {logbook.industrialReview?.comment ? (
                <div className="rounded-lg bg-muted p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-medium">Your Review</Label>
                  </div>
                  <p className="text-sm">{logbook.industrialReview.comment}</p>
                  {logbook.industrialReview.rating ? (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Rating:</span> {logbook.industrialReview.rating}/10
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
