import { Eye, MessageSquare } from "lucide-react";
import { ActionMenu, AtlassianTable, StatusBadge } from "@/components/design-system";
import type { Logbook } from "../types";

function getIndustrialReview(logbook: Logbook) {
  return (
    logbook.industrialReview ||
    logbook.reviews?.find((review) => review.supervisorType === "industrial")
  );
}

function resolveReviewStatus(logbook: Logbook) {
  const overallStatus = (logbook.status || "").toLowerCase();
  if (overallStatus === "draft") return "draft";
  if (overallStatus === "approved" || overallStatus === "rejected") {
    return overallStatus;
  }

  const industrialReview = getIndustrialReview(logbook);
  if (industrialReview?.status) {
    return industrialReview.status.toLowerCase();
  }

  const roleStatus = (logbook.industrialReviewStatus || "").toLowerCase();
  if (["approved", "rejected", "reviewed"].includes(roleStatus)) {
    return roleStatus;
  }

  return "submitted";
}

interface LogbookEntriesTableProps {
  logbooks: Logbook[];
  statusFilter: string;
  isSubmittingReview: boolean;
  onReview: (logbook: Logbook) => void;
}

export function LogbookEntriesTable({
  logbooks,
  statusFilter,
  isSubmittingReview,
  onReview,
}: LogbookEntriesTableProps) {
  return (
    <AtlassianTable
      title="Logbook Entries"
      subtitle={`${logbooks.length} entr${logbooks.length === 1 ? "y" : "ies"}`}
      data={logbooks}
      rowKey={(logbook) => logbook.id}
      columns={[
        {
          id: "week",
          header: "Week",
          sortable: true,
          sortAccessor: (logbook) => logbook.weekNumber || 0,
          render: (logbook) => (
            <span className="text-sm font-medium text-foreground">Week {logbook.weekNumber}</span>
          ),
        },
        {
          id: "period",
          header: "Period",
          sortable: true,
          sortAccessor: (logbook) => logbook.startDate || "",
          render: (logbook) => (
            <span className="text-sm text-foreground">
              {new Date(logbook.startDate).toLocaleDateString()} -{" "}
              {new Date(logbook.endDate).toLocaleDateString()}
            </span>
          ),
        },
        {
          id: "submittedAt",
          header: "Submitted",
          sortable: true,
          sortAccessor: (logbook) => logbook.submittedAt || "",
          render: (logbook) => (
            <span className="text-sm text-foreground">
              {logbook.submittedAt ? new Date(logbook.submittedAt).toLocaleDateString() : "Not submitted"}
            </span>
          ),
        },
        {
          id: "status",
          header: "Status",
          sortable: true,
          sortAccessor: (logbook) => resolveReviewStatus(logbook),
          render: (logbook) => <StatusBadge status={resolveReviewStatus(logbook)} />,
        },
        {
          id: "actions",
          header: "",
          align: "right",
          width: 56,
          render: (logbook) => {
            const hasExistingReview = Boolean(getIndustrialReview(logbook));
            const isReviewable =
              resolveReviewStatus(logbook) === "submitted" && !hasExistingReview;
            return (
              <ActionMenu
                items={[
                  {
                    label: isReviewable ? "Review Entry" : "View Entry",
                    icon: isReviewable ? (
                      <MessageSquare className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    ),
                    onClick: () => onReview(logbook),
                    disabled: isSubmittingReview,
                  },
                ]}
              />
            );
          },
        },
      ]}
      emptyTitle="No logbooks found"
      emptyDescription={
        statusFilter === "all"
          ? "This student has no logbook entries yet."
          : "Try adjusting your status filter."
      }
      emptyIcon={<MessageSquare className="h-6 w-6 text-accent-foreground" />}
    />
  );
}
