"use client";

import { LoadingPage } from "@/components/design-system";
import { AcademicSupervisorsHeader } from "./components/AcademicSupervisorsHeader";
import { AcademicSupervisorsList } from "./components/AcademicSupervisorsList";
import { AcademicSupervisorStats } from "./components/AcademicSupervisorStats";
import { useAcademicSupervisors } from "./hooks/useAcademicSupervisors";

export default function AcademicSupervisorsPage() {
  const {
    academicSupervisors,
    availableCount,
    totalStudentsSupervised,
    isLoading,
  } = useAcademicSupervisors();

  if (isLoading) {
    return <LoadingPage label="Loading academic supervisors..." />;
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <AcademicSupervisorsHeader />

      <AcademicSupervisorStats
        total={academicSupervisors.length}
        available={availableCount}
        studentsSupervised={totalStudentsSupervised}
      />

      <AcademicSupervisorsList
        supervisors={academicSupervisors}
      />
    </div>
  );
}
