"use client";

import Link from "next/link";
import { useFacultyDetails } from "./_hooks/useFacultyDetails";
import FacultyOverview from "./_components/FacultyOverview";
import FacultyDepartments from "./_components/FacultyDepartments";
import {
  EmptyState,
  ErrorGlobalState,
  LoadingPage,
  PageHeader,
  SectionCard,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { ArrowLeft, School, Building } from "lucide-react";

export default function FacultyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { queries, mutations, data } = useFacultyDetails(params.id);

  if (queries.facultyQuery.isLoading) {
    return <LoadingPage label="Loading faculty details..." />;
  }

  if (queries.facultyQuery.isError) {
    return (
      <ErrorGlobalState
        title="Unable to load faculty"
        message={
          (queries.facultyQuery.error as Error)?.message || "Please try again."
        }
        onRetry={() => void queries.facultyQuery.refetch()}
      />
    );
  }

  if (!data.faculty) {
    return (
      <div className="space-y-4 md:space-y-5">
        <PageHeader
          title="Faculty Not Found"
          description="This faculty doesn't exist or was removed."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/faculties">Return to Directory</Link>
            </Button>
          }
        />
        <EmptyState
          title="No faculty record"
          description="The requested faculty could not be located."
          icon={<School className="h-12 w-12 text-muted-foreground/50" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title={data.faculty.name}
        description={`Manage faculty profile and departments (${data.departments.length} total).`}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/faculties">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Directory
            </Link>
          </Button>
        }
      />

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <School className="h-4 w-4" />
            <span>Code: {data.faculty.code || "N/A"}</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{data.departments.length} linked department(s)</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <School className="h-4 w-4" />
            <span>Dean: {data.faculty.dean || "Not assigned"}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionCard
            title="Faculty Overview"
            description="Profile information and editable details."
          >
            <FacultyOverview
              faculty={data.faculty}
              updateMutation={mutations.updateMutation}
            />
          </SectionCard>
        </div>

        <div className="lg:col-span-8">
          <SectionCard
            title="Associated Departments"
            description="Departments currently linked to this faculty."
          >
            <FacultyDepartments
              isLoading={queries.departmentsQuery.isLoading}
              departments={data.departments}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
