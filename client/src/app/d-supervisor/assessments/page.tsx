"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Plus, UserCheck } from "lucide-react";
import {
  ActionMenu,
  AtlassianTable,
  DashboardMetricsGrid,
  ErrorLocalState,
  FilterFieldSearch,
  FilterFieldSelect,
  LoadingPage,
  PageHeader,
  StatusBadge,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { AssessmentCreateDialog } from "./components/AssessmentCreateDialog";
import { AssessmentDetailsDialog } from "./components/AssessmentDetailsDialog";
import { useSupervisorAssessments } from "./hooks/useSupervisorAssessments";
import { calculateAverageScore } from "./utils/assessment-ui";

export default function DSupervisorAssessmentsPage() {
  useEffect(() => {
    document.title = "Assessments | ITMS";
  }, []);

  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    assessments,
    students,
    pendingAssessments,
    completedAssessments,
    isLoading,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    selectedStudent,
    setSelectedStudent,
    assessmentType,
    setAssessmentType,
    selectedAssessment,
    setSelectedAssessment,
    isViewDialogOpen,
    setIsViewDialogOpen,
    scores,
    setScores,
    strengths,
    setStrengths,
    areasForImprovement,
    setAreasForImprovement,
    comment,
    setComment,
    recommendation,
    setRecommendation,
    handleCreateAssessment,
    createAssessmentMutation,
  } = useSupervisorAssessments();

  const filteredAssessments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return assessments.filter((assessment) => {
      const name = `${assessment.student?.user?.firstName || ""} ${assessment.student?.user?.lastName || ""}`
        .trim()
        .toLowerCase();
      const matchesQuery =
        !query ||
        name.includes(query) ||
        assessment.student?.matricNumber?.toLowerCase().includes(query) ||
        (assessment.grade || "").toLowerCase().includes(query);

      if (!matchesQuery) return false;

      if (statusFilter === "pending" && assessment.status !== "pending") return false;
      if (statusFilter === "completed" && assessment.status === "pending") return false;
      if (typeFilter !== "all" && assessment.type !== typeFilter) return false;
      return true;
    });
  }, [assessments, searchQuery, statusFilter, typeFilter]);

  const metrics = [
    {
      label: "Total Assessments",
      value: assessments.length,
      hint: "Assessment records created by you",
      trend: "up" as const,
    },
    {
      label: "Pending",
      value: pendingAssessments.length,
      hint: "Awaiting submission or approval",
      trend: pendingAssessments.length > 0 ? ("down" as const) : ("up" as const),
    },
    {
      label: "Completed",
      value: completedAssessments.length,
      hint: "Submitted and finalized records",
      trend: "up" as const,
    },
    {
      label: "Assigned Students",
      value: students.length,
      hint: "Students available for assessment",
      trend: "neutral" as const,
    },
  ];

  if (isLoading) {
    return <LoadingPage label="Loading assessments..." />;
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Student Assessments"
        description="Evaluate student performance and manage assessment records."
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)} className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        }
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
            placeholder="Status"
            className="w-full min-w-0"
            options={[
              { label: "All Status", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Completed", value: "completed" },
            ]}
          />
          <FilterFieldSelect
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="Type"
            className="w-full min-w-0"
            options={[
              { label: "All Types", value: "all" },
              { label: "Midterm", value: "midterm" },
              { label: "Final", value: "final" },
            ]}
          />
        </div>
      </section>

      <AtlassianTable
        title="Assessment Records"
        subtitle={`${filteredAssessments.length} record${filteredAssessments.length === 1 ? "" : "s"}`}
        data={filteredAssessments}
        rowKey={(assessment) => assessment.id}
        columns={[
          {
            id: "student",
            header: "Student",
            sortable: true,
            sortAccessor: (assessment) =>
              `${assessment.student?.user?.firstName || ""} ${assessment.student?.user?.lastName || ""}`.trim(),
            render: (assessment) => (
              <div className="flex items-center gap-2.5">
                <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {assessment.student?.user?.firstName} {assessment.student?.user?.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {assessment.student?.matricNumber || "N/A"}
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: "type",
            header: "Type",
            sortable: true,
            sortAccessor: (assessment) => assessment.type || "",
            render: (assessment) => (
              <span className="capitalize text-sm text-foreground">{assessment.type || "N/A"}</span>
            ),
          },
          {
            id: "score",
            header: "Avg Score",
            sortable: true,
            sortAccessor: (assessment) => Number(calculateAverageScore(assessment.scores) || 0),
            render: (assessment) => (
              <span className="text-sm font-medium text-foreground">
                {calculateAverageScore(assessment.scores)}%
              </span>
            ),
          },
          {
            id: "grade",
            header: "Grade",
            sortable: true,
            sortAccessor: (assessment) => assessment.grade || "",
            render: (assessment) => <span className="text-sm text-foreground">{assessment.grade || "N/A"}</span>,
          },
          {
            id: "status",
            header: "Status",
            sortable: true,
            sortAccessor: (assessment) => assessment.status || "",
            render: (assessment) => <StatusBadge status={assessment.status || "pending"} />,
          },
          {
            id: "date",
            header: "Created",
            sortable: true,
            sortAccessor: (assessment) => assessment.createdAt || "",
            render: (assessment) => (
              <span className="text-sm text-foreground">
                {new Date(assessment.createdAt).toLocaleDateString()}
              </span>
            ),
          },
          {
            id: "actions",
            header: "",
            align: "right",
            width: 56,
            render: (assessment) => (
              <ActionMenu
                items={[
                  {
                    label: "View Details",
                    icon: <Eye className="h-3.5 w-3.5" />,
                    onClick: () => {
                      setSelectedAssessment(assessment);
                      setIsViewDialogOpen(true);
                    },
                  },
                ]}
              />
            ),
          },
        ]}
        emptyTitle="No assessments found"
        emptyDescription={
          searchQuery || statusFilter !== "all" || typeFilter !== "all"
            ? "Try adjusting your search and filters."
            : "Create your first assessment to get started."
        }
        emptyIcon={<UserCheck className="h-6 w-6 text-accent-foreground" />}
      />

      <AssessmentCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        students={students}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        assessmentType={assessmentType}
        setAssessmentType={setAssessmentType}
        scores={scores}
        setScores={setScores}
        strengths={strengths}
        setStrengths={setStrengths}
        areasForImprovement={areasForImprovement}
        setAreasForImprovement={setAreasForImprovement}
        comment={comment}
        setComment={setComment}
        recommendation={recommendation}
        setRecommendation={setRecommendation}
        onSubmit={handleCreateAssessment}
        isSubmitting={createAssessmentMutation.isPending}
      />

      <AssessmentDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        assessment={selectedAssessment}
      />
    </div>
  );
}
