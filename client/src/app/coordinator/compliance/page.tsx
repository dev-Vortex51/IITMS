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
import { ComplianceFormDetailsDialog } from "@/app/student/compliance/components/ComplianceFormDetailsDialog";
import type { ComplianceFormRecord } from "@/app/student/compliance/types";
import { CoordinatorComplianceTable } from "./components/CoordinatorComplianceTable";
import { useCoordinatorCompliance } from "./hooks/useCoordinatorCompliance";

export default function CoordinatorCompliancePage() {
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedForm, setSelectedForm] = useState<ComplianceFormRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { forms, isLoading, isError, reviewMutation } = useCoordinatorCompliance();

  const filteredForms = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return forms.filter((form) => {
      const studentName = `${form.student.user.firstName} ${form.student.user.lastName}`.toLowerCase();

      const matchesQuery =
        !query ||
        studentName.includes(query) ||
        form.student.matricNumber.toLowerCase().includes(query) ||
        (form.title || "").toLowerCase().includes(query);

      if (!matchesQuery) return false;
      if (statusFilter !== "all" && form.status !== statusFilter) return false;
      if (typeFilter !== "all" && form.formType !== typeFilter) return false;
      return true;
    });
  }, [forms, searchQuery, statusFilter, typeFilter]);

  if (isLoading) {
    return <LoadingPage label="Loading compliance registry..." />;
  }

  if (isError) {
    return (
      <div className="space-y-4 md:space-y-5">
        <PageHeader
          title="Compliance Forms Registry"
          description="Review submitted SIWES compliance forms across your department."
        />
        <ErrorLocalState message="Compliance registry could not be loaded." />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Compliance Forms Registry"
        description="Review submitted SIWES compliance forms across your department."
      />

      <DashboardMetricsGrid
        items={[
          { label: "Total Forms", value: forms.length, hint: "Department records", trend: "up" },
          {
            label: "Submitted",
            value: forms.filter((item) => item.status === "submitted").length,
            hint: "Pending review",
            trend: "neutral",
          },
          {
            label: "Approved",
            value: forms.filter((item) => item.status === "approved").length,
            hint: "Approved by coordinator/admin",
            trend: "up",
          },
          {
            label: "Rejected",
            value: forms.filter((item) => item.status === "rejected").length,
            hint: "Need resubmission",
            trend: "down",
          },
        ]}
      />

      <section className="rounded-lg border bg-card p-3 shadow-sm md:p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px] md:items-center">
          <FilterFieldSearch
            placeholder="Search by student, matric number, or title"
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
          <FilterFieldSelect
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="Filter by form type"
            className="w-full min-w-0"
            options={[
              { label: "All Types", value: "all" },
              { label: "Introduction Letter", value: "introduction_letter" },
              { label: "Acceptance Letter", value: "acceptance_letter" },
              { label: "ITF Form 8", value: "itf_form_8" },
              { label: "School SIWES Form", value: "school_form" },
              { label: "Indemnity Form", value: "indemnity_form" },
              { label: "Monthly Clearance", value: "monthly_clearance" },
              { label: "Final Clearance", value: "final_clearance" },
            ]}
          />
        </div>
      </section>

      <CoordinatorComplianceTable
        forms={filteredForms}
        onView={(form) => {
          setSelectedForm(form);
          setIsDetailsOpen(true);
        }}
        onApprove={(id) => reviewMutation.mutate({ id, status: "approved" })}
        onReject={(id) => reviewMutation.mutate({ id, status: "rejected" })}
      />

      <ComplianceFormDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        form={selectedForm}
      />
    </div>
  );
}
