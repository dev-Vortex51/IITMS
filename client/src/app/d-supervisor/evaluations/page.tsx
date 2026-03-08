"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import {
  DashboardMetricsGrid,
  FilterFieldSearch,
  FilterFieldSelect,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { EvaluationCreateDialog } from "./components/EvaluationCreateDialog";
import { EvaluationDetailsDialog } from "./components/EvaluationDetailsDialog";
import { EvaluationsTable } from "./components/EvaluationsTable";
import { useDepartmentalEvaluations } from "./hooks/useDepartmentalEvaluations";

export default function EvaluationsPage() {
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const {
    evaluations,
    students,
    isLoading,
    isCreateDialogOpen,
    editingEvaluationId,
    openCreateDialog,
    openEditDialog,
    handleCloseDialog,
    selectedEvaluation,
    setSelectedEvaluation,
    isViewDialogOpen,
    setIsViewDialogOpen,
    selectedStudent,
    setSelectedStudent,
    evaluationType,
    setEvaluationType,
    scores,
    setScores,
    strengths,
    setStrengths,
    areasForImprovement,
    setAreasForImprovement,
    comment,
    setComment,
    handleCreateEvaluation,
    createEvaluationMutation,
    updateEvaluationMutation,
    submitEvaluationMutation,
    completeEvaluationMutation,
  } = useDepartmentalEvaluations();

  const filteredEvaluations = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return evaluations.filter((evaluation) => {
      const name = `${evaluation.student?.user?.firstName || ""} ${evaluation.student?.user?.lastName || ""}`
        .trim()
        .toLowerCase();
      const matchesQuery =
        !query ||
        name.includes(query) ||
        evaluation.student?.matricNumber?.toLowerCase().includes(query) ||
        (evaluation.grade || "").toLowerCase().includes(query);

      if (!matchesQuery) return false;
      if (statusFilter !== "all" && evaluation.status !== statusFilter) return false;
      if (typeFilter !== "all" && evaluation.type !== typeFilter) return false;

      return true;
    });
  }, [evaluations, searchQuery, statusFilter, typeFilter]);

  const completedCount = evaluations.filter((item) => item.status === "completed").length;
  const submittedCount = evaluations.filter((item) => item.status === "submitted").length;
  const draftCount = evaluations.filter((item) => item.status === "draft").length;

  if (isLoading) {
    return <LoadingPage label="Loading evaluations..." />;
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Student Evaluations"
        description="Create and manage structured performance evaluations for assigned students."
        actions={
          <Button onClick={() => openCreateDialog()} className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            New Evaluation
          </Button>
        }
      />

      <DashboardMetricsGrid
        items={[
          {
            label: "Total Evaluations",
            value: evaluations.length,
            hint: "All records created by you",
            trend: "up",
          },
          {
            label: "Completed",
            value: completedCount,
            hint: "Marked as completed",
            trend: "up",
          },
          {
            label: "Submitted",
            value: submittedCount,
            hint: "Submitted but not completed",
            trend: submittedCount > 0 ? "neutral" : "up",
          },
          {
            label: "Drafts",
            value: draftCount,
            hint: "Not submitted yet",
            trend: draftCount > 0 ? "down" : "up",
          },
        ]}
      />

      <section className="rounded-lg border bg-card p-3 shadow-sm md:p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px] md:items-center">
          <FilterFieldSearch
            placeholder="Search by student name, matric number, or grade"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full max-w-none"
          />
          <FilterFieldSelect
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
            className="w-full min-w-0"
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Draft", value: "draft" },
              { label: "Submitted", value: "submitted" },
              { label: "Completed", value: "completed" },
            ]}
          />
          <FilterFieldSelect
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="Filter by type"
            className="w-full min-w-0"
            options={[
              { label: "All Types", value: "all" },
              { label: "Midterm", value: "midterm" },
              { label: "Final", value: "final" },
            ]}
          />
        </div>
      </section>

      <EvaluationsTable
        evaluations={filteredEvaluations}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onView={(evaluation) => {
          setSelectedEvaluation(evaluation);
          setIsViewDialogOpen(true);
        }}
        onEdit={openEditDialog}
        onSubmit={(id) => submitEvaluationMutation.mutate(id)}
        onComplete={(id) => completeEvaluationMutation.mutate(id)}
      />

      <EvaluationCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        students={students}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        evaluationType={evaluationType}
        setEvaluationType={setEvaluationType}
        scores={scores}
        setScores={setScores}
        strengths={strengths}
        setStrengths={setStrengths}
        areasForImprovement={areasForImprovement}
        setAreasForImprovement={setAreasForImprovement}
        comment={comment}
        setComment={setComment}
        mode={editingEvaluationId ? "edit" : "create"}
        onSubmit={handleCreateEvaluation}
        isSubmitting={
          createEvaluationMutation.isPending || updateEvaluationMutation.isPending
        }
      />

      <EvaluationDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        evaluation={selectedEvaluation}
      />
    </div>
  );
}
