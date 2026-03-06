import { useMemo, useState } from "react";
import { Edit, Eye, Send } from "lucide-react";
import { format } from "date-fns";
import { AtlassianTable, type AtlassianTableColumn } from "@/components/design-system/atlassian-table";
import { ActionMenu } from "@/components/design-system/action-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { LogbookEntry } from "@/services/logbook.service";
import { getLogbookStatusInfo } from "../utils/logbook-ui";

interface LogbookAccordionProps {
  logbooks: LogbookEntry[];
  onEdit: (entry: LogbookEntry) => void;
  onSubmit: (id: string) => void;
  isSubmitting: boolean;
}

const getEntryId = (entry: LogbookEntry) => String((entry as any).id || (entry as any)._id);

export function LogbookAccordion({
  logbooks,
  onEdit,
  onSubmit,
  isSubmitting,
}: LogbookAccordionProps) {
  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(null);

  const statusSummary = useMemo(() => {
    const draft = logbooks.filter((entry) => entry.status === "draft").length;
    const submitted = logbooks.filter((entry) => entry.status === "submitted").length;
    const reviewed = logbooks.filter((entry) => entry.status === "reviewed").length;
    const approved = logbooks.filter((entry) => entry.status === "approved").length;

    return { draft, submitted, reviewed, approved };
  }, [logbooks]);

  const columns: AtlassianTableColumn<LogbookEntry>[] = [
    {
      id: "weekNumber",
      header: "Week",
      sortable: true,
      sortAccessor: (entry) => Number(entry.weekNumber),
      render: (entry) => (
        <div>
          <p className="text-sm font-semibold text-foreground">Week {entry.weekNumber}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(entry.startDate), "MMM d")} - {format(new Date(entry.endDate), "MMM d, yyyy")}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (entry) => entry.status,
      render: (entry) => {
        const statusInfo = getLogbookStatusInfo(entry.status);
        const StatusIcon = statusInfo.icon;

        return (
          <Badge variant={statusInfo.variant as any} className="capitalize">
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      id: "reviews",
      header: "Reviews",
      align: "center",
      sortable: true,
      sortAccessor: (entry) => entry.reviews?.length || 0,
      render: (entry) => (
        <span className="text-sm font-medium text-foreground">{entry.reviews?.length || 0}</span>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      sortable: true,
      sortAccessor: (entry) => new Date(entry.updatedAt).getTime(),
      render: (entry) => (
        <p className="text-sm text-muted-foreground">
          {format(new Date(entry.updatedAt), "MMM d, yyyy")}
        </p>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      render: (entry) => (
        <div className="flex items-center justify-end">
          <ActionMenu
            items={[
              {
                label: "View details",
                icon: <Eye className="h-3.5 w-3.5" />,
                onClick: () => setSelectedEntry(entry),
              },
              {
                label: "Edit draft",
                icon: <Edit className="h-3.5 w-3.5" />,
                disabled: entry.status !== "draft",
                onClick: () => onEdit(entry),
              },
              {
                label: "Submit for review",
                icon: <Send className="h-3.5 w-3.5" />,
                disabled: entry.status !== "draft" || isSubmitting,
                onClick: () => onSubmit(getEntryId(entry)),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <AtlassianTable
        title="Weekly Logbook Entries"
        subtitle={`Draft: ${statusSummary.draft} · Submitted: ${statusSummary.submitted} · Reviewed: ${statusSummary.reviewed} · Approved: ${statusSummary.approved}`}
        data={logbooks}
        columns={columns}
        rowKey={getEntryId}
        emptyTitle="No logbook entries"
        emptyDescription="Create your first weekly logbook entry to start tracking progress."
        initialPageSize={10}
      />

      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selectedEntry ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Week {selectedEntry.weekNumber} Logbook Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <DetailBlock label="Tasks Performed" value={selectedEntry.tasksPerformed} />
                <DetailBlock label="Skills Acquired" value={selectedEntry.skillsAcquired} />
                <DetailBlock label="Challenges" value={selectedEntry.challenges} />
                <DetailBlock label="Lessons Learned" value={selectedEntry.lessonsLearned} />

                {selectedEntry.reviews?.length ? (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Supervisor Reviews</Label>
                    <div className="space-y-2">
                      {selectedEntry.reviews.map((review, index) => (
                        <div key={`${review.reviewedAt}-${index}`} className="rounded-md border border-border bg-muted/20 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold capitalize">{review.supervisorType} Supervisor</p>
                            {typeof review.rating === "number" ? (
                              <Badge variant="outline">{review.rating}/10</Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm">{review.comment}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {format(new Date(review.reviewedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="space-y-1">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <p className="rounded-md border border-border bg-muted/20 p-3 text-sm leading-relaxed">
        {value}
      </p>
    </div>
  );
}
