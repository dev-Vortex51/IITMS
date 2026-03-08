"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMetricsGrid, LoadingPage, PageHeader } from "@/components/design-system";
import { Card, CardContent } from "@/components/ui/card";
import { FinalReportDialog } from "./components/FinalReportDialog";
import { FinalReportSummaryCard } from "./components/FinalReportSummaryCard";
import { useStudentFinalReport } from "./hooks/useStudentFinalReport";

export default function StudentFinalReportPage() {
  const {
    report,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    title,
    setTitle,
    abstractText,
    setAbstractText,
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
  } = useStudentFinalReport();

  if (isLoading) {
    return <LoadingPage label="Loading final report..." />;
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Final Technical Report"
        description="Prepare, upload, and submit your final SIWES technical report."
        actions={
          <Button onClick={report ? openEdit : openCreate} className="h-9">
            {report ? (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Edit Report
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Report
              </>
            )}
          </Button>
        }
      />

      <DashboardMetricsGrid
        items={[
          {
            label: "Report Status",
            value: report?.status || "not_started",
            hint: "Submission lifecycle",
            trend: report?.status === "approved" ? "up" : "neutral",
          },
          {
            label: "Document",
            value: report?.documentPath ? "uploaded" : "missing",
            hint: "Final report file",
            trend: report?.documentPath ? "up" : "down",
          },
        ]}
      />

      {report ? (
        <FinalReportSummaryCard
          report={report}
          onEdit={openEdit}
          onSubmit={() => submitMutation.mutate(report.id)}
          isSubmitting={submitMutation.isPending}
        />
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No final technical report yet. Create and upload your report to begin review.
          </CardContent>
        </Card>
      )}

      <FinalReportDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={title}
        setTitle={setTitle}
        abstractText={abstractText}
        setAbstractText={setAbstractText}
        note={note}
        setNote={setNote}
        documentFile={documentFile}
        setDocumentFile={setDocumentFile}
        editing={!!report}
        onSave={save}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
