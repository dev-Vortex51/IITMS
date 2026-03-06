"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { Briefcase, ArrowLeft } from "lucide-react";
import { usePlacementReview } from "./_hooks/usePlacementReview";

import { PlacementStatusCard } from "./_components/PlacementStatusCard";
import { PlacementCompanyCard } from "./_components/PlacementCompanyCard";
import { PlacementSupervisorCard } from "./_components/PlacementSupervisorCard";
import { PlacementReviewAction } from "./_components/PlacementReviewAction";

export default function StudentPlacementPage({
  params,
}: {
  params: { id: string };
}) {
  const reviewData = usePlacementReview(params.id);
  const { placement, isLoading } = reviewData;

  if (isLoading) {
    return <LoadingPage label="Loading placement details..." />;
  }

  // Empty State
  if (!placement) {
    return (
      <div className="space-y-4 md:space-y-5 max-w-5xl">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/coordinator/students/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <Card className="border-dashed border-2">
          <CardContent className="pt-8 pb-8">
            <EmptyState
              title="No Placement Registered"
              description="This student has not submitted a placement application yet."
              icon={<Briefcase className="h-8 w-8 text-accent-foreground" />}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 max-w-5xl">
      <PageHeader
        title="Placement Review"
        description="Review student placement details and approval status."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/coordinator/students/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
        }
      />

      <PlacementStatusCard placement={placement} />
      <PlacementCompanyCard placement={placement} />
      <PlacementSupervisorCard placement={placement} />

      {placement.coordinator_remarks ? (
        <Card className="border border-border shadow-sm">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">
              Previous Remarks
            </h4>
            <p className="text-sm leading-relaxed">
              {placement.coordinator_remarks}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {placement.status === "pending" ? (
        <PlacementReviewAction {...reviewData} />
      ) : null}
    </div>
  );
}
