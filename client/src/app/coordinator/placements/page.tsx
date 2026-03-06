"use client";

import { useEffect } from "react";
import { usePlacements } from "./hooks/usePlacements";
import { PlacementMetrics } from "./components/PlacementMetrics";
import { PlacementFilters } from "./components/PlacementFilters";
import { PlacementList } from "./components/PlacementList";
import {
  ErrorLocalState,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";

export default function CoordinatorPlacementsPage() {
  useEffect(() => {
    document.title = "Placements | ITMS";
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredPlacements,
    metrics,
    isLoading,
    isError,
  } = usePlacements();

  if (isLoading) {
    return <LoadingPage label="Loading placements..." />;
  }

  if (isError) {
    return (
      <div className="space-y-4 md:space-y-5">
        <PageHeader
          title="Student Placements"
          description="Review, approve, and manage placement applications."
        />
        <ErrorLocalState message="Placement data could not be loaded." />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Student Placements"
        description="Review, approve, and manage placement applications."
      />

      <PlacementMetrics metrics={metrics} />

      <PlacementFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <PlacementList placements={filteredPlacements} isLoading={isLoading} />
    </div>
  );
}
