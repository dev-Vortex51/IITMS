"use client";

import { ExportOptions } from "./components/ExportOptions";
import { FacultyBreakdown } from "./components/FacultyBreakdown";
import { ReportFilters } from "./components/ReportFilters";
import { ReportsHeader } from "./components/ReportsHeader";
import { SystemOverviewStats } from "./components/SystemOverviewStats";
import { useAdminReports } from "./hooks/useAdminReports";
import { LoadingPage } from "@/components/design-system";

export default function AdminReportsPage() {
  const {
    selectedFaculty,
    setSelectedFaculty,
    selectedDepartment,
    setSelectedDepartment,
    faculties,
    departments,
    filteredDepartments,
    filteredFaculties,
    stats,
    isLoading,
  } = useAdminReports();

  if (isLoading) {
    return <LoadingPage label="Loading reports..." />;
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <ReportsHeader />

      <SystemOverviewStats stats={stats} />

      <ReportFilters
        selectedFaculty={selectedFaculty}
        onFacultyChange={setSelectedFaculty}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        faculties={faculties}
        departments={filteredDepartments}
      />

      <ExportOptions />

      <FacultyBreakdown
        faculties={filteredFaculties}
        departments={departments}
      />
    </div>
  );
}
