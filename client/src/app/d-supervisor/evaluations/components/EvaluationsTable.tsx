"use client";

import { CheckCircle2, Eye, Pencil, Send } from "lucide-react";
import { ActionMenu, AtlassianTable, StatusBadge } from "@/components/design-system";
import type { Evaluation } from "../types";

interface EvaluationsTableProps {
  evaluations: Evaluation[];
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
  onView: (evaluation: Evaluation) => void;
  onEdit?: (evaluation: Evaluation) => void;
  onSubmit?: (id: string) => void;
  onComplete?: (id: string) => void;
  canEditDraft?: boolean;
  canSubmitDraft?: boolean;
  canMarkCompleted?: boolean;
}

export function EvaluationsTable({
  evaluations,
  searchQuery,
  statusFilter,
  typeFilter,
  onView,
  onEdit,
  onSubmit,
  onComplete,
  canEditDraft = true,
  canSubmitDraft = true,
  canMarkCompleted = true,
}: EvaluationsTableProps) {
  return (
    <AtlassianTable
      title="Evaluation Records"
      subtitle={`${evaluations.length} record${evaluations.length === 1 ? "" : "s"}`}
      data={evaluations}
      rowKey={(evaluation) => evaluation.id}
      columns={[
        {
          id: "student",
          header: "Student",
          sortable: true,
          sortAccessor: (evaluation) =>
            `${evaluation.student?.user?.firstName || ""} ${evaluation.student?.user?.lastName || ""}`.trim(),
          render: (evaluation) => (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {evaluation.student?.user?.firstName} {evaluation.student?.user?.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {evaluation.student?.matricNumber || "N/A"}
              </p>
            </div>
          ),
        },
        {
          id: "type",
          header: "Type",
          sortable: true,
          sortAccessor: (evaluation) => evaluation.type,
          render: (evaluation) => (
            <span className="capitalize text-sm text-foreground">{evaluation.type}</span>
          ),
        },
        {
          id: "score",
          header: "Total Score",
          sortable: true,
          sortAccessor: (evaluation) => evaluation.totalScore || 0,
          render: (evaluation) => (
            <span className="text-sm font-medium text-foreground">
              {typeof evaluation.totalScore === "number"
                ? `${evaluation.totalScore.toFixed(1)}%`
                : "N/A"}
            </span>
          ),
        },
        {
          id: "grade",
          header: "Grade",
          sortable: true,
          sortAccessor: (evaluation) => evaluation.grade || "",
          render: (evaluation) => (
            <span className="text-sm text-foreground">{evaluation.grade || "N/A"}</span>
          ),
        },
        {
          id: "status",
          header: "Status",
          sortable: true,
          sortAccessor: (evaluation) => evaluation.status,
          render: (evaluation) => <StatusBadge status={evaluation.status || "draft"} />,
        },
        {
          id: "date",
          header: "Created",
          sortable: true,
          sortAccessor: (evaluation) => evaluation.createdAt || "",
          render: (evaluation) => (
            <span className="text-sm text-foreground">
              {new Date(evaluation.createdAt).toLocaleDateString()}
            </span>
          ),
        },
        {
          id: "actions",
          header: "",
          align: "right",
          width: 56,
          render: (evaluation) => (
            <ActionMenu
              items={[
                {
                  label: "View Details",
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => onView(evaluation),
                },
                ...(evaluation.status === "draft"
                  ? [
                      ...(canEditDraft && onEdit
                        ? [
                            {
                              label: "Edit Draft",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              onClick: () => onEdit(evaluation),
                            },
                          ]
                        : []),
                      ...(canSubmitDraft && onSubmit
                        ? [
                            {
                              label: "Submit Evaluation",
                              icon: <Send className="h-3.5 w-3.5" />,
                              onClick: () => onSubmit(evaluation.id),
                            },
                          ]
                        : []),
                    ]
                  : []),
                ...(evaluation.status === "submitted" && canMarkCompleted && onComplete
                  ? [
                      {
                        label: "Mark Completed",
                        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                        onClick: () => onComplete(evaluation.id),
                      },
                    ]
                  : []),
              ]}
            />
          ),
        },
      ]}
      emptyTitle="No evaluations found"
      emptyDescription={
        searchQuery || statusFilter !== "all" || typeFilter !== "all"
          ? "Try adjusting your search and filters."
          : "Create your first evaluation to get started."
      }
    />
  );
}
