import { BookOpen, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/design-system";
import type { Logbook } from "../types";
import { getStatusBadge } from "../utils/logbook-ui";

interface StudentLogbookListProps {
  logbooks: Logbook[];
  statusFilter: string;
  isSubmittingReview: boolean;
  onReview: (logbook: Logbook) => void;
}

export function StudentLogbookList({
  logbooks,
  statusFilter,
  isSubmittingReview,
  onReview,
}: StudentLogbookListProps) {
  if (!logbooks.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <EmptyState
            title="No logbooks found"
            description={
              statusFilter === "all"
                ? "This student has no logbook entries yet."
                : "Try adjusting your status filter."
            }
            icon={<BookOpen className="h-12 w-12 text-muted-foreground/50" />}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logbooks.map((logbook) => {
        const statusConfig = getStatusBadge(logbook);
        const isReviewable = logbook.departmentalReview?.status === "submitted";

        return (
          <Card key={logbook.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold">Week {logbook.weekNumber}</h3>
                    <Badge variant={statusConfig.variant}>{statusConfig.text}</Badge>
                  </div>

                  <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Period:</span>{" "}
                      {new Date(logbook.startDate).toLocaleDateString()} -{" "}
                      {new Date(logbook.endDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Submitted:</span>{" "}
                      {logbook.submittedAt
                        ? new Date(logbook.submittedAt).toLocaleDateString()
                        : "Not submitted"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Tasks Performed</p>
                      <p className="line-clamp-2 text-sm">{logbook.tasksPerformed || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Skills Acquired</p>
                      <p className="line-clamp-2 text-sm">{logbook.skillsAcquired || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <Button
                    size="sm"
                    variant={isReviewable ? "default" : "outline"}
                    disabled={isSubmittingReview}
                    onClick={() => onReview(logbook)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {isReviewable ? "Review" : "View"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
