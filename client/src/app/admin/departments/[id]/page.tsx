"use client";

import { useDepartmentDetails } from "./_hooks/useDepartmentDetails";
import DepartmentHeader from "./_components/DepartmentHeader";
import DepartmentOverview from "./_components/DepartmentOverview";
import DepartmentCoordinators from "./_components/DepartmentCoordinators";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepartmentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { queries, mutations, data } = useDepartmentDetails(params.id);

  console.log("Page render - coordinatorsList:", data.coordinatorsList);
  console.log(
    "Page render - coordinatorQueries.isLoading:",
    queries.coordinatorQueries.isLoading,
  );
  console.log(
    "Page render - coordinatorQueries.data:",
    queries.coordinatorQueries.data,
  );

  if (queries.departmentQuery.isLoading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <Skeleton className="h-8 w-32" />
        <div className="flex justify-between items-end border-b pb-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-20 w-32 rounded-xl" />
            <Skeleton className="h-20 w-32 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Skeleton className="h-[300px] rounded-xl lg:col-span-4 lg:sticky lg:top-6" />
          <Skeleton className="h-[400px] rounded-xl lg:col-span-8" />
        </div>
      </div>
    );
  }

  if (!data.department) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        Department not found.
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DepartmentHeader department={data.department} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Fixed Overview */}
        <div className="lg:col-span-4 lg:sticky lg:top-6">
          <DepartmentOverview
            department={data.department}
            faculties={data.faculties}
            updateMutation={mutations.updateMutation}
          />
        </div>

        {/* Right Column: Coordinators */}
        <div className="lg:col-span-8">
          <DepartmentCoordinators
            isLoading={queries.coordinatorQueries.isLoading}
            coordinators={data.coordinatorsList}
          />
        </div>
      </div>
    </div>
  );
}
