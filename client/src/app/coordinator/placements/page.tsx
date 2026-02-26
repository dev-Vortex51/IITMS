"use client";

import { useEffect } from "react";
import { usePlacements } from "./hooks/usePlacements";
import { PlacementMetrics } from "./components/PlacementMetrics";
import { PlacementFilters } from "./components/PlacementFilters";
import { PlacementList } from "./components/PlacementList";

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
  } = usePlacements();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Student Placements
          </h1>
          <p className="text-muted-foreground mt-1">
            Review, approve, and manage placement applications.
          </p>
        </div>
      </div>

      {/* Ribbon Metrics */}
      <PlacementMetrics metrics={metrics} />

      {/* Main Content Area */}
      <div className="space-y-4">
        <PlacementFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <PlacementList placements={filteredPlacements} isLoading={isLoading} />
      </div>
    </div>
  );
}
