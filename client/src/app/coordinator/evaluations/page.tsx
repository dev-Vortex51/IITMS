"use client";

import { useMemo, useState } from "react";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import {
  DashboardMetricsGrid,
  ErrorLocalState,
  FilterFieldSearch,
  FilterFieldSelect,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { EvaluationsTable } from "@/app/d-supervisor/evaluations/components/EvaluationsTable";
import { EvaluationDetailsDialog } from "@/app/d-supervisor/evaluations/components/EvaluationDetailsDialog";
import type { Evaluation } from "@/app/d-supervisor/evaluations/types";
import { useCoordinatorEvaluations } from "./hooks/useCoordinatorEvaluations";

export default function CoordinatorEvaluationsPage() {
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(
    null,
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { evaluations, isLoading, isError, completeMutation } =
    useCoordinatorEvaluations();

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

  const metrics = [
    {
      label: "Total Evaluations",
      value: evaluations.length,
      hint: "Department-scope evaluation records",
      trend: "up" as const,
    },
    {
      label: "Submitted",
      value: evaluations.filter((item) => item.status === "submitted").length,
      hint: "Awaiting completion",
      trend: "neutral" as const,
    },
    {
      label: "Completed",
      value: evaluations.filter((item) => item.status === "completed").length,
      hint: "Finalized records",
      trend: "up" as const,
    },
    {
      label: "Drafts",
      value: evaluations.filter((item) => item.status === "draft").length,
      hint: "Supervisor drafts not yet submitted",
      trend: "down" as const,
    },
  ];

  if (isLoading) {
    return <LoadingPage label="Loading evaluations..." />;
  }

  if (isError) {
    return (
      <div className="space-y-4 md:space-y-5">
        <PageHeader
          title="Evaluation Review"
          description="Review and complete departmental supervisor evaluations."
        />
        <ErrorLocalState message="Evaluation records could not be loaded." />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Evaluation Review"
        description="Review and complete departmental supervisor evaluations."
      />

      <DashboardMetricsGrid items={metrics} />

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
        onComplete={(id) => completeMutation.mutate(id)}
        canEditDraft={false}
        canSubmitDraft={false}
        canMarkCompleted
      />

      <EvaluationDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        evaluation={selectedEvaluation}
      />
    </div>
  );
}
