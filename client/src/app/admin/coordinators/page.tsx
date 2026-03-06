"use client";

import { CoordinatorsHeader } from "./components/CoordinatorsHeader";
import { CoordinatorStats } from "./components/CoordinatorStats";
import { CoordinatorsList } from "./components/CoordinatorsList";
import { UnassignedDepartments } from "./components/UnassignedDepartments";
import { useAdminCoordinators } from "./hooks/useAdminCoordinators";
import { LoadingPage } from "@/components/design-system";

export default function CoordinatorsPage() {
  const {
    departments,
    departmentsWithCoordinators,
    unassignedDepartments,
    getCoordinatorInfo,
    isLoading,
  } = useAdminCoordinators();

  return (
    <div className="space-y-4 md:space-y-5">
      <CoordinatorsHeader />

      <CoordinatorStats
        departmentsCount={departments.length}
        assignedDepartmentsCount={departmentsWithCoordinators.length}
      />

      {isLoading ? (
        <LoadingPage label="Loading coordinators..." />
      ) : (
        <CoordinatorsList
          departments={departmentsWithCoordinators}
          getCoordinatorInfo={getCoordinatorInfo}
        />
      )}

      <UnassignedDepartments departments={unassignedDepartments} />
    </div>
  );
}
