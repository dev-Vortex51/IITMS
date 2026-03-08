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
import { FinalReportDetailsDialog } from "@/app/student/final-report/components/FinalReportDetailsDialog";
import type { TechnicalReportRecord } from "@/app/student/final-report/types";
import { CoordinatorFinalReportsTable } from "./components/CoordinatorFinalReportsTable";
import { useCoordinatorFinalReports } from "./hooks/useCoordinatorFinalReports";

export default function CoordinatorFinalReportsPage() {
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<TechnicalReportRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { reports, isLoading, isError, reviewMutation } = useCoordinatorFinalReports();

  const filteredReports = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return reports.filter((report) => {
      const studentName = `${report.student.user.firstName} ${report.student.user.lastName}`.toLowerCase();
      const matchesQuery =
        !query ||
        studentName.includes(query) ||
        report.student.matricNumber.toLowerCase().includes(query) ||
        (report.title || "").toLowerCase().includes(query);

      if (!matchesQuery) return false;
      if (statusFilter !== "all" && report.status !== statusFilter) return false;

      return true;
    });
  }, [reports, searchQuery, statusFilter]);

  if (isLoading) {
    return <LoadingPage label="Loading final reports..." />;
  }

  if (isError) {
    return (
      <div className="space-y-4 md:space-y-5">
        <PageHeader
          title="Final Technical Reports"
          description="Review and approve/reject final student technical reports."
        />
        <ErrorLocalState message="Final reports could not be loaded." />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Final Technical Reports"
        description="Review and approve/reject final student technical reports."
      />

      <DashboardMetricsGrid
        items={[
          { label: "Total", value: reports.length, hint: "Department records", trend: "up" },
          {
            label: "Submitted",
            value: reports.filter((item) => item.status === "submitted").length,
            hint: "Pending review",
            trend: "neutral",
          },
          {
            label: "Approved",
            value: reports.filter((item) => item.status === "approved").length,
            hint: "Cleared reports",
            trend: "up",
          },
          {
            label: "Rejected",
            value: reports.filter((item) => item.status === "rejected").length,
            hint: "Needs revision",
            trend: "down",
          },
        ]}
      />

      <section className="rounded-lg border bg-card p-3 shadow-sm md:p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
          <FilterFieldSearch
            placeholder="Search by student, matric number, or report title"
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
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
          />
        </div>
      </section>

      <CoordinatorFinalReportsTable
        reports={filteredReports}
        onView={(report) => {
          setSelectedReport(report);
          setIsDetailsOpen(true);
        }}
        onApprove={(id) => reviewMutation.mutate({ id, status: "approved" })}
        onReject={(id) => reviewMutation.mutate({ id, status: "rejected" })}
      />

      <FinalReportDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        report={selectedReport}
      />
    </div>
  );
}
