"use client";

import { CheckCircle2, Eye, XCircle, ExternalLink } from "lucide-react";
import { ActionMenu, AtlassianTable, StatusBadge } from "@/components/design-system";
import type { ComplianceFormRecord } from "@/app/student/compliance/types";

const typeLabelMap: Record<string, string> = {
  acceptance_letter: "Acceptance Letter",
  introduction_letter: "Introduction Letter",
  monthly_clearance: "Monthly Clearance",
  indemnity_form: "Indemnity Form",
  itf_form_8: "ITF Form 8",
  school_form: "School SIWES Form",
  final_clearance: "Final Clearance",
};

interface CoordinatorComplianceTableProps {
  forms: ComplianceFormRecord[];
  onView: (form: ComplianceFormRecord) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function CoordinatorComplianceTable({ forms, onView, onApprove, onReject }: CoordinatorComplianceTableProps) {
  return (
    <AtlassianTable
      title="Compliance Forms Registry"
      subtitle={`${forms.length} record${forms.length === 1 ? "" : "s"}`}
      data={forms}
      rowKey={(form) => form.id}
      columns={[
        {
          id: "student",
          header: "Student",
          sortable: true,
          sortAccessor: (form) => `${form.student.user.firstName} ${form.student.user.lastName}`,
          render: (form) => (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {form.student.user.firstName} {form.student.user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{form.student.matricNumber}</p>
            </div>
          ),
        },
        {
          id: "type",
          header: "Form",
          sortable: true,
          sortAccessor: (form) => form.formType,
          render: (form) => <span className="text-sm text-foreground">{typeLabelMap[form.formType] || form.formType}</span>,
        },
        {
          id: "document",
          header: "Document",
          render: (form) =>
            form.documentPath ? (
              <a
                href={form.documentPath}
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
          sortAccessor: (form) => form.status,
          render: (form) => <StatusBadge status={form.status} />,
        },
        {
          id: "updatedAt",
          header: "Updated",
          sortable: true,
          sortAccessor: (form) => form.updatedAt,
          render: (form) => <span className="text-sm text-foreground">{new Date(form.updatedAt).toLocaleDateString()}</span>,
        },
        {
          id: "actions",
          header: "",
          align: "right",
          width: 56,
          render: (form) => (
            <ActionMenu
              items={[
                {
                  label: "View Details",
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => onView(form),
                },
                ...(form.status === "submitted"
                  ? [
                      {
                        label: "Approve",
                        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                        onClick: () => onApprove(form.id),
                      },
                      {
                        label: "Reject",
                        icon: <XCircle className="h-3.5 w-3.5" />,
                        onClick: () => onReject(form.id),
                      },
                    ]
                  : []),
              ]}
            />
          ),
        },
      ]}
      emptyTitle="No compliance forms found"
      emptyDescription="Student submissions will appear here for review."
    />
  );
}
