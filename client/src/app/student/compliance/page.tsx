"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMetricsGrid, LoadingPage, PageHeader } from "@/components/design-system";
import { ComplianceFormDialog } from "./components/ComplianceFormDialog";
import { ComplianceFormsTable } from "./components/ComplianceFormsTable";
import { ComplianceFormDetailsDialog } from "./components/ComplianceFormDetailsDialog";
import { useStudentCompliance } from "./hooks/useStudentCompliance";
import type { ComplianceFormRecord } from "./types";

export default function StudentCompliancePage() {
  const {
    forms,
    template,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    editingForm,
    selectedType,
    setSelectedType,
    title,
    setTitle,
    note,
    setNote,
    documentFile,
    setDocumentFile,
    openCreate,
    openEdit,
    save,
    createMutation,
    updateMutation,
    submitMutation,
  } = useStudentCompliance();

  const [selectedForm, setSelectedForm] = useState<ComplianceFormRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const metrics = useMemo(
    () => [
      {
        label: "Total Forms",
        value: forms.length,
        hint: "Registry entries",
        trend: "up" as const,
      },
      {
        label: "Submitted",
        value: forms.filter((item) => item.status === "submitted").length,
        hint: "Awaiting review",
        trend: "neutral" as const,
      },
      {
        label: "Approved",
        value: forms.filter((item) => item.status === "approved").length,
        hint: "Validated forms",
        trend: "up" as const,
      },
      {
        label: "Draft/Rejected",
        value: forms.filter((item) => ["draft", "rejected"].includes(item.status)).length,
        hint: "Need action",
        trend: "down" as const,
      },
    ],
    [forms],
  );

  if (isLoading) {
    return <LoadingPage label="Loading compliance registry..." />;
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="SIWES Compliance Forms"
        description="Upload, track, and submit required compliance forms for review."
        actions={
          <Button onClick={openCreate} className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Button>
        }
      />

      <DashboardMetricsGrid items={metrics} />

      <ComplianceFormsTable
        forms={forms}
        onView={(form) => {
          setSelectedForm(form);
          setIsDetailsOpen(true);
        }}
        onEdit={openEdit}
        onSubmit={(id) => submitMutation.mutate(id)}
      />

      <ComplianceFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        template={template}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        title={title}
        setTitle={setTitle}
        note={note}
        setNote={setNote}
        documentFile={documentFile}
        setDocumentFile={setDocumentFile}
        editing={!!editingForm}
        onSave={save}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <ComplianceFormDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        form={selectedForm}
      />
    </div>
  );
}
