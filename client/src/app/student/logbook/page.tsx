"use client";

import { useEffect } from "react";
import { BookOpen, Clock3, FileCheck2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertInline,
  ErrorLocalState,
  LoadingPage,
  LoadingTableSkeleton,
  PageHeader,
  SectionCard,
} from "@/components/design-system";
import { StatCard } from "@/components/design-system/stat-card";
import { LogbookFormDialog } from "./components/LogbookFormDialog";
import { LogbookAccordion } from "./components/LogbookAccordion";
import { LogbookAccessNotice } from "./components/LogbookAccessNotice";
import { LogbookEmptyState } from "./components/LogbookEmptyState";
import { useStudentLogbook } from "./hooks/useStudentLogbook";

export default function StudentLogbookPage() {
  useEffect(() => {
    document.title = "Logbook | ITMS";
  }, []);

  const {
    placement,
    isLoadingPlacement,
    isErrorPlacement,
    refetchPlacement,
    logbooks,
    isLoadingLogbooks,
    isErrorLogbooks,
    refetchLogbooks,
    showForm,
    setShowForm,
    editingEntry,
    activeWeekContext,
    formData,
    setFormData,
    selectedFiles,
    setSelectedFiles,
    error,
    success,
    resetForm,
    handleSubmit,
    handleEdit,
    handleSubmitEntry,
    createMutation,
    updateMutation,
    submitMutation,
    isOnline,
    pendingSyncCount,
    isSyncingOffline,
    syncOfflineChanges,
  } = useStudentLogbook();

  if (isLoadingPlacement) {
    return <LoadingPage label="Loading logbook..." />;
  }

  if (isErrorPlacement || isErrorLogbooks) {
    return (
      <div className="space-y-4 md:space-y-5 max-w-6xl">
        <PageHeader
          title="Logbook"
          description="Track weekly training activities and supervision feedback."
        />
        <ErrorLocalState
          message="Logbook data could not be loaded."
          onRetry={() => {
            refetchPlacement();
            refetchLogbooks();
          }}
        />
      </div>
    );
  }

  if (!placement || placement?.status !== "approved") {
    return (
      <div className="space-y-4 md:space-y-5 max-w-6xl">
        <PageHeader
          title="Logbook"
          description="Track weekly training activities and supervision feedback."
        />
        <LogbookAccessNotice hasPlacement={!!placement} />
      </div>
    );
  }

  const totalEntries = logbooks.length;
  const draftEntries = logbooks.filter((entry) => entry.status === "draft").length;
  const inReviewEntries = logbooks.filter(
    (entry) => entry.status === "submitted" || entry.status === "reviewed",
  ).length;
  const approvedEntries = logbooks.filter((entry) => entry.status === "approved").length;

  return (
    <div className="space-y-4 md:space-y-5 max-w-6xl">
      <PageHeader
        title="Logbook"
        description="Track weekly training activities and supervision feedback."
        actions={
          !showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Entries"
          value={totalEntries}
          hint="All weekly logs"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          label="Drafts"
          value={draftEntries}
          hint="Pending submission"
          icon={<Clock3 className="h-4 w-4" />}
        />
        <StatCard
          label="In Review"
          value={inReviewEntries}
          hint="Submitted/reviewed entries"
          icon={<FileCheck2 className="h-4 w-4" />}
        />
        <StatCard
          label="Approved"
          value={approvedEntries}
          hint="Finalized by supervisors"
          icon={<FileCheck2 className="h-4 w-4" />}
        />
      </div>

      {success ? (
        <AlertInline tone="success" message={success} />
      ) : null}

      {!isOnline ? (
        <AlertInline
          tone="warning"
          message={`You are offline. Drafts and submissions will be queued locally (${pendingSyncCount} pending).`}
        />
      ) : null}

      {isOnline && pendingSyncCount > 0 ? (
        <AlertInline
          tone="info"
          message={`${pendingSyncCount} offline change(s) pending sync.${isSyncingOffline ? " Syncing now..." : ""}`}
        />
      ) : null}

      <LogbookFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        formData={formData}
        setFormData={setFormData}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        editingEntry={editingEntry}
        activeWeekContext={activeWeekContext}
        isSaving={createMutation.isPending || updateMutation.isPending}
        error={error}
      />

      <SectionCard
        title="Entries"
        description="Review, edit, and submit your weekly logbook records."
        actions={
          isOnline && pendingSyncCount > 0 ? (
            <Button
              variant="outline"
              onClick={() => {
                void syncOfflineChanges();
              }}
              disabled={isSyncingOffline}
            >
              {isSyncingOffline ? "Syncing..." : "Sync Offline Changes"}
            </Button>
          ) : null
        }
      >
        {isLoadingLogbooks ? (
          <LoadingTableSkeleton />
        ) : logbooks.length > 0 ? (
          <LogbookAccordion
            logbooks={logbooks}
            onEdit={handleEdit}
            onSubmit={handleSubmitEntry}
            isSubmitting={submitMutation.isPending}
          />
        ) : (
          <LogbookEmptyState onCreate={() => setShowForm(true)} />
        )}
      </SectionCard>
    </div>
  );
}
