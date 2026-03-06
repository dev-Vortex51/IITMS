"use client";

import { ArrowLeft } from "lucide-react";
import {
  DashboardMetricsGrid,
  ErrorGlobalState,
  FilterFieldSearch,
  FilterFieldSelect,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { LogbookEntriesTable } from "./components/LogbookEntriesTable";
import { LogbookReviewDialog } from "./components/LogbookReviewDialog";
import { LogbookStudentTable } from "./components/LogbookStudentTable";
import { useDepartmentalSupervisorLogbooks } from "./hooks/useDepartmentalSupervisorLogbooks";
import { formatStudentName } from "./utils/logbook-ui";

export default function DSupervisorLogbooksPage() {
  const {
    students,
    filteredStudents,
    filteredLogbooks,
    selectedStudent,
    selectStudent,
    clearSelectedStudent,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedLogbook,
    openReviewDialog,
    closeReviewDialog,
    isReviewDialogOpen,
    submitReview,
    isSubmittingReview,
    totalPendingReviews,
    totalReviewed,
    isLoading,
    isError,
    error,
    retry,
  } = useDepartmentalSupervisorLogbooks();

  if (isLoading) {
    return <LoadingPage label="Loading students..." />;
  }

  if (isError) {
    return (
      <ErrorGlobalState
        title="Unable to load logbook reviews"
        message={(error as Error)?.message || "Please try again."}
        onRetry={() => {
          void retry();
        }}
      />
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title={
          selectedStudent
            ? `${formatStudentName(selectedStudent)}'s Logbooks`
            : "Logbook Reviews"
        }
        description={
          selectedStudent
            ? `Approve reviewed logbook entries for ${selectedStudent.matricNumber}`
            : "Manage industrial-reviewed logbook submissions"
        }
        actions={
          selectedStudent ? (
            <Button variant="outline" size="sm" onClick={clearSelectedStudent}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Button>
          ) : null
        }
      />

      <DashboardMetricsGrid
        items={
          selectedStudent
            ? [
                {
                  label: "Total Logbooks",
                  value: selectedStudent.totalLogbooks || 0,
                  hint: "Entries submitted by this student",
                  trend: "up" as const,
                },
                {
                  label: "Pending Review",
                  value: selectedStudent.pendingReview || 0,
                  hint: "Awaiting your final approval",
                  trend:
                    (selectedStudent.pendingReview || 0) > 0
                      ? ("down" as const)
                      : ("up" as const),
                },
                {
                  label: "Approved",
                  value: selectedStudent.approved || 0,
                  hint: "Entries finalized by you",
                  trend: "neutral" as const,
                },
                {
                  label: "Approval Rate",
                  value:
                    (selectedStudent.totalLogbooks || 0) > 0
                      ? `${Math.round(((selectedStudent.approved || 0) / (selectedStudent.totalLogbooks || 1)) * 100)}%`
                      : "0%",
                  hint: "Approved entries ratio",
                  trend: "up" as const,
                },
              ]
            : [
                {
                  label: "Assigned Students",
                  value: students.length,
                  hint: "Students under your supervision",
                  trend: "up" as const,
                },
                {
                  label: "Pending Review",
                  value: totalPendingReviews,
                  hint: "Reviewed entries awaiting approval",
                  trend: totalPendingReviews > 0 ? ("down" as const) : ("up" as const),
                },
                {
                  label: "Approved",
                  value: totalReviewed,
                  hint: "Finalized entries",
                  trend: "up" as const,
                },
                {
                  label: "Review Rate",
                  value:
                    totalPendingReviews + totalReviewed > 0
                      ? `${Math.round((totalReviewed / (totalPendingReviews + totalReviewed)) * 100)}%`
                      : "0%",
                  hint: "Completion across all submitted entries",
                  trend: "neutral" as const,
                },
              ]
        }
      />

      <section className="rounded-lg border bg-card p-3 shadow-sm md:p-4">
        <div
          className={
            selectedStudent
              ? "grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-center"
              : "grid gap-3"
          }
        >
          <FilterFieldSearch
            placeholder={
              selectedStudent
                ? "Search by week details..."
                : "Search by student name or matric number..."
            }
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full max-w-none"
          />
          {selectedStudent ? (
            <FilterFieldSelect
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by status"
              className="w-full min-w-0"
              options={[
                { label: "All Status", value: "all" },
                { label: "Pending Approval", value: "pending" },
                { label: "Approved", value: "approved" },
              ]}
            />
          ) : null}
        </div>
      </section>

      {!selectedStudent ? (
        <LogbookStudentTable
          students={filteredStudents}
          searchQuery={searchQuery}
          onSelectStudent={selectStudent}
        />
      ) : (
        <LogbookEntriesTable
          logbooks={filteredLogbooks}
          statusFilter={statusFilter}
          isSubmittingReview={isSubmittingReview}
          onReview={openReviewDialog}
        />
      )}

      <LogbookReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeReviewDialog();
            return;
          }
        }}
        selectedStudent={selectedStudent}
        selectedLogbook={selectedLogbook}
        onSubmitReview={submitReview}
        isSubmittingReview={isSubmittingReview}
        onClose={closeReviewDialog}
      />
    </div>
  );
}
