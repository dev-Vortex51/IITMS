"use client";

import { CheckCircle2, Eye, ExternalLink, XCircle } from "lucide-react";
import { ActionMenu, AtlassianTable, StatusBadge } from "@/components/design-system";
import type { TechnicalReportRecord } from "@/app/student/final-report/types";

interface CoordinatorFinalReportsTableProps {
  reports: TechnicalReportRecord[];
  onView: (report: TechnicalReportRecord) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function CoordinatorFinalReportsTable({
  reports,
  onView,
  onApprove,
  onReject,
}: CoordinatorFinalReportsTableProps) {
  return (
    <AtlassianTable
      title="Final Technical Reports"
      subtitle={`${reports.length} record${reports.length === 1 ? "" : "s"}`}
      data={reports}
      rowKey={(report) => report.id}
      columns={[
        {
          id: "student",
          header: "Student",
          sortable: true,
          sortAccessor: (report) => `${report.student.user.firstName} ${report.student.user.lastName}`,
          render: (report) => (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {report.student.user.firstName} {report.student.user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{report.student.matricNumber}</p>
            </div>
          ),
        },
        {
          id: "title",
          header: "Title",
          sortable: true,
          sortAccessor: (report) => report.title || "",
          render: (report) => <span className="text-sm text-foreground">{report.title || "Untitled"}</span>,
        },
        {
          id: "document",
          header: "Document",
          render: (report) =>
            report.documentPath ? (
              <a
                href={report.documentPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                View <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">Not uploaded</span>
            ),
        },
        {
          id: "status",
          header: "Status",
          sortable: true,
          sortAccessor: (report) => report.status,
          render: (report) => <StatusBadge status={report.status} />,
        },
        {
          id: "updatedAt",
          header: "Updated",
          sortable: true,
          sortAccessor: (report) => report.updatedAt,
          render: (report) => <span className="text-sm text-foreground">{new Date(report.updatedAt).toLocaleDateString()}</span>,
        },
        {
          id: "actions",
          header: "",
          align: "right",
          width: 56,
          render: (report) => (
            <ActionMenu
              items={[
                {
                  label: "View Details",
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => onView(report),
                },
                ...(report.status === "submitted"
                  ? [
                      {
                        label: "Approve",
                        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                        onClick: () => onApprove(report.id),
                      },
                      {
                        label: "Reject",
                        icon: <XCircle className="h-3.5 w-3.5" />,
                        onClick: () => onReject(report.id),
                      },
                    ]
                  : []),
              ]}
            />
          ),
        },
      ]}
      emptyTitle="No final reports found"
      emptyDescription="Student final report submissions will appear here for review."
    />
  );
}
