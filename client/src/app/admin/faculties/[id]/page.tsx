"use client";

import Link from "next/link";
import { useFacultyDetails } from "./_hooks/useFacultyDetails";
import FacultyHeader from "./_components/FacultyHeader";
import FacultyOverview from "./_components/FacultyOverview";
import FacultyDepartments from "./_components/FacultyDepartments";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { School } from "lucide-react";

export default function FacultyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { queries, mutations, data } = useFacultyDetails(params.id);

  if (queries.facultyQuery.isLoading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <Skeleton className="h-8 w-32" />
        <div className="flex justify-between items-end border-b pb-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-64" />
          </div>
          <Skeleton className="h-20 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Skeleton className="h-[300px] rounded-xl lg:col-span-4 lg:sticky lg:top-6" />
          <Skeleton className="h-[400px] rounded-xl lg:col-span-8" />
        </div>
      </div>
    );
  }

  if (!data.faculty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="p-4 rounded-full bg-muted/50 border border-border/50">
          <School className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Faculty Not Found
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            This faculty doesn&apos;t exist or was removed.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href="/admin/faculties">Return to Directory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FacultyHeader
        faculty={data.faculty}
        departmentCount={data.departments.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Fixed Overview */}
        <div className="lg:col-span-4 lg:sticky lg:top-6">
          <FacultyOverview
            faculty={data.faculty}
            updateMutation={mutations.updateMutation}
          />
        </div>

        {/* Right Column: Departments Grid */}
        <div className="lg:col-span-8">
          <FacultyDepartments
            isLoading={queries.departmentsQuery.isLoading}
            departments={data.departments}
          />
        </div>
      </div>
    </div>
  );
}
