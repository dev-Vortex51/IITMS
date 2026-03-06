"use client";

import Link from "next/link";
import { useDepartmentDetails } from "./_hooks/useDepartmentDetails";
import DepartmentOverview from "./_components/DepartmentOverview";
import DepartmentCoordinators from "./_components/DepartmentCoordinators";
import {
  EmptyState,
  ErrorGlobalState,
  LoadingPage,
  PageHeader,
  SectionCard,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, School, UserCog } from "lucide-react";

export default function DepartmentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { queries, mutations, data } = useDepartmentDetails(params.id);

  if (queries.departmentQuery.isLoading) {
    return <LoadingPage label="Loading department details..." />;
  }

  if (queries.departmentQuery.isError) {
    return (
      <ErrorGlobalState
        title="Unable to load department"
        message={
          (queries.departmentQuery.error as Error)?.message || "Please try again."
        }
        onRetry={() => void queries.departmentQuery.refetch()}
      />
    );
  }

  if (!data.department) {
    return (
      <div className="space-y-4 md:space-y-5">
        <PageHeader
          title="Department Not Found"
          description="The requested department could not be located."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/departments">Back to Departments</Link>
            </Button>
          }
        />
        <EmptyState
          title="No department record"
          description="This department doesn't exist or was removed."
          icon={<Building className="h-12 w-12 text-muted-foreground/50" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title={data.department.name}
        description={`Department details and coordinator coverage for ${data.department.code}.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Departments
            </Link>
          </Button>
        }
      />

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>Code: {data.department.code || "N/A"}</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <School className="h-4 w-4" />
            <span>
              Faculty:{" "}
              {typeof data.department.faculty === "object"
                ? data.department.faculty?.code || "N/A"
                : "N/A"}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <UserCog className="h-4 w-4" />
            <span>{data.coordinatorsList.length} coordinator(s) assigned</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionCard
            title="Department Overview"
            description="Core metadata and editable attributes."
          >
            <DepartmentOverview
              department={data.department}
              faculties={data.faculties}
              updateMutation={mutations.updateMutation}
            />
          </SectionCard>
        </div>

        <div className="lg:col-span-8">
          <SectionCard
            title="Assigned Coordinators"
            description="Primary staff contacts managing placements for this department."
          >
            <DepartmentCoordinators
              isLoading={queries.coordinatorQueries.isLoading}
              coordinators={data.coordinatorsList}
            />
          </SectionCard>
        </div>
      </div>

    </div>
  );
}
