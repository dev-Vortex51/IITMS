"use client";

import { Eye, Pencil, Send, ExternalLink } from "lucide-react";
import { ActionMenu, AtlassianTable, StatusBadge } from "@/components/design-system";
import type { ComplianceFormRecord } from "../types";

const typeLabelMap: Record<string, string> = {
  acceptance_letter: "Acceptance Letter",
  introduction_letter: "Introduction Letter",
  monthly_clearance: "Monthly Clearance",
  indemnity_form: "Indemnity Form",
  itf_form_8: "ITF Form 8",
  school_form: "School SIWES Form",
  final_clearance: "Final Clearance",
};

interface ComplianceFormsTableProps {
  forms: ComplianceFormRecord[];
  onView: (form: ComplianceFormRecord) => void;
  onEdit: (form: ComplianceFormRecord) => void;
  onSubmit: (id: string) => void;
}

export function ComplianceFormsTable({ forms, onView, onEdit, onSubmit }: ComplianceFormsTableProps) {
  return (
    <AtlassianTable
      title="Compliance Registry"
      subtitle={`${forms.length} record${forms.length === 1 ? "" : "s"}`}
      data={forms}
      rowKey={(form) => form.id}
      columns={[
        {
          id: "formType",
          header: "Form",
          sortable: true,
          sortAccessor: (form) => form.formType,
          render: (form) => (
            <span className="text-sm text-foreground">{typeLabelMap[form.formType] || form.formType}</span>
          ),
        },
        {
          id: "title",
          header: "Title",
          render: (form) => <span className="text-sm text-foreground">{form.title || "-"}</span>,
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
          render: (form) => (
            <span className="text-sm text-foreground">{new Date(form.updatedAt).toLocaleDateString()}</span>
          ),
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
                ...(form.status !== "approved"
                  ? [
                      {
                        label: "Edit",
                        icon: <Pencil className="h-3.5 w-3.5" />,
                        onClick: () => onEdit(form),
                      },
                    ]
                  : []),
                ...(form.status === "draft" || form.status === "rejected"
                  ? [
                      {
                        label: "Submit",
                        icon: <Send className="h-3.5 w-3.5" />,
                        onClick: () => onSubmit(form.id),
                      },
                    ]
                  : []),
              ]}
            />
          ),
        },
      ]}
      emptyTitle="No compliance forms"
      emptyDescription="Create and submit required SIWES compliance forms."
    />
  );
}
