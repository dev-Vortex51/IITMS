"use client";

import { ChevronLeft } from "lucide-react";
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
import { useIndustrySupervisorLogbooks } from "./hooks/useIndustrySupervisorLogbooks";
import { formatStudentName } from "./utils/logbook-ui";

export default function ISupervisorLogbooksPage() {
  const {
    selectedStudent,
    setSelectedStudent,
    selectedLogbook,
    isReviewDialogOpen,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    students,
    filteredStudents,
    filteredLogbooks,
    totalPendingReviews,
    totalLogbooks,
    openReviewDialog,
    closeReviewDialog,
    goBackToStudents,
    submitReview,
    isLoading,
    isError,
    error,
    retry,
    isSubmittingReview,
  } = useIndustrySupervisorLogbooks();

  if (isLoading) {
    return <LoadingPage label="Loading students and logbooks..." />;
  }

  if (isError) {
    return (
      <ErrorGlobalState
        title="Unable to load logbooks"
        message={(error as Error)?.message || "Please try again."}
        onRetry={() => {
          void retry();
        }}
      />
    );
  }

  const isStudentListView = !selectedStudent;

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title={isStudentListView ? "Student Logbooks" : `${formatStudentName(selectedStudent)}'s Logbooks`}
        description={
          isStudentListView
            ? "Review logbook entries from your assigned students"
            : selectedStudent?.matricNumber || ""
        }
        actions={
          isStudentListView ? null : (
            <Button variant="outline" size="sm" onClick={goBackToStudents}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Button>
          )
        }
      />

      <DashboardMetricsGrid
        items={
          isStudentListView
            ? [
                {
                  label: "Assigned Students",
                  value: students.length,
                  hint: "Students under your supervision",
                  trend: "up" as const,
                },
                {
                  label: "Pending Reviews",
                  value: totalPendingReviews,
                  hint: "Entries awaiting your action",
                  trend: totalPendingReviews > 0 ? ("down" as const) : ("up" as const),
                },
                {
                  label: "Total Logbooks",
                  value: totalLogbooks,
                  hint: "All submitted and draft entries",
                  trend: "up" as const,
                },
                {
                  label: "Review Rate",
                  value:
                    totalLogbooks > 0
                      ? `${Math.round(((totalLogbooks - totalPendingReviews) / totalLogbooks) * 100)}%`
                      : "0%",
                  hint: "Reviewed vs total logbooks",
                  trend: "neutral" as const,
                },
              ]
            : [
                {
                  label: "Total Logbooks",
                  value: selectedStudent.totalLogbooks || 0,
                  hint: "Entries for this student",
                  trend: "up" as const,
                },
                {
                  label: "Pending Review",
                  value: selectedStudent.pendingReview || 0,
                  hint: "Awaiting your feedback",
                  trend:
                    (selectedStudent.pendingReview || 0) > 0
                      ? ("down" as const)
                      : ("up" as const),
                },
                {
                  label: "Reviewed",
                  value: selectedStudent.reviewed || 0,
                  hint: "Approved and rejected entries",
                  trend: "up" as const,
                },
                {
                  label: "Review Rate",
                  value:
                    (selectedStudent.totalLogbooks || 0) > 0
                      ? `${Math.round(((selectedStudent.reviewed || 0) / (selectedStudent.totalLogbooks || 1)) * 100)}%`
                      : "0%",
                  hint: "Reviewed entries ratio",
                  trend: "neutral" as const,
                },
              ]
        }
      />

      <section className="rounded-lg border bg-card p-3 shadow-sm md:p-4">
        <div
          className={
            !isStudentListView
              ? "grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-center"
              : "grid gap-3"
          }
        >
          <FilterFieldSearch
            placeholder={
              isStudentListView
                ? "Search by student name or matric number..."
                : "Search by week details..."
            }
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full max-w-none"
          />
          {!isStudentListView ? (
            <FilterFieldSelect
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by status"
              className="w-full min-w-0"
              options={[
                { label: "All Status", value: "all" },
                { label: "Pending Review", value: "pending" },
                { label: "Reviewed", value: "reviewed" },
              ]}
            />
          ) : null}
        </div>
      </section>

      {isStudentListView ? (
        <LogbookStudentTable
          students={filteredStudents}
          searchQuery={searchQuery}
          onSelectStudent={setSelectedStudent}
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
          }
        }}
        logbook={selectedLogbook}
        onSubmitReview={submitReview}
        isSubmittingReview={isSubmittingReview}
      />
    </div>
  );
}
