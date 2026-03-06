import { Eye, MessageSquare } from "lucide-react";
import { ActionMenu, AtlassianTable, StatusBadge } from "@/components/design-system";
import type { Logbook } from "../types";

interface LogbookEntriesTableProps {
  logbooks: Logbook[];
  statusFilter: string;
  isSubmittingReview: boolean;
  onReview: (logbook: Logbook) => void;
}

function getDepartmentalReview(logbook: Logbook) {
  return (
    logbook.departmentalReview ||
    logbook.reviews?.find(
      (review) =>
        review.supervisorType === "departmental" ||
        review.supervisorType === "academic",
    )
  );
}

function getIndustrialStatus(logbook: Logbook) {
  return (
    logbook.industrialReview?.status ||
    logbook.industrialReviewStatus ||
    logbook.status ||
    ""
  ).toLowerCase();
}

function resolveReviewStatus(logbook: Logbook) {
  const overallStatus = (logbook.status || "").toLowerCase();
  if (
    overallStatus === "draft" ||
    overallStatus === "submitted" ||
    overallStatus === "reviewed" ||
    overallStatus === "approved" ||
    overallStatus === "rejected"
  ) {
    return overallStatus;
  }

  const departmentalReview = getDepartmentalReview(logbook);
  if (
    departmentalReview ||
    ["approved", "reviewed"].includes(
      (logbook.departmentalReviewStatus || "").toLowerCase(),
    )
  ) {
    return "approved";
  }

  return "reviewed";
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
              {logbook.submittedAt
                ? new Date(logbook.submittedAt).toLocaleDateString()
                : "Not submitted"}
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
            const status = resolveReviewStatus(logbook);
            const hasExistingReview = Boolean(getDepartmentalReview(logbook));
            const industrialStatus = getIndustrialStatus(logbook);
            const isReviewable =
              status === "reviewed" &&
              industrialStatus === "reviewed" &&
              !hasExistingReview &&
              (logbook.status || "").toLowerCase() === "reviewed";
            return (
              <ActionMenu
                items={[
                  {
                    label: isReviewable ? "Approve Entry" : "View Entry",
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
