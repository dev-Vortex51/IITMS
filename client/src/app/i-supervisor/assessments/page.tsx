"use client";

import { AssessmentFilters } from "./components/AssessmentFilters";
import { AssessmentGuidelines } from "./components/AssessmentGuidelines";
import { AssessmentsHeader } from "./components/AssessmentsHeader";
import { AssessmentsList } from "./components/AssessmentsList";
import { AssessmentStats } from "./components/AssessmentStats";
import { useIndustrySupervisorAssessments } from "./hooks/useIndustrySupervisorAssessments";

export default function AssessmentsPage() {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    assessments,
    filteredAssessments,
    completedCount,
    draftCount,
    averageScore,
    isLoading,
  } = useIndustrySupervisorAssessments();

  return (
    <div className="space-y-6">
      <AssessmentsHeader />

      <AssessmentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <AssessmentStats
        total={assessments.length}
        completed={completedCount}
        drafts={draftCount}
        averageScore={averageScore}
      />

      <AssessmentsList
        assessments={filteredAssessments}
        isLoading={isLoading}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
      />

      <AssessmentGuidelines />
    </div>
  );
}
