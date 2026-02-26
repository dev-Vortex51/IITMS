"use client";

import Link from "next/link";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowLeft } from "lucide-react";
import { usePlacementReview } from "./_hooks/usePlacementReview";

import { PlacementHeader } from "./_components/PlacementHeader";
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading size="lg" />
        <p className="text-muted-foreground mt-4">
          Loading placement details...
        </p>
      </div>
    );
  }

  // Empty State
  if (!placement) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/coordinator/students/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <Card className="border-dashed border-2">
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-xl">No Placement Registered</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              This student has not submitted a placement application yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PlacementHeader studentId={params.id} />

      <PlacementStatusCard placement={placement} />

      <PlacementCompanyCard placement={placement} />

      <PlacementSupervisorCard placement={placement} />

      {placement.coordinator_remarks && (
        <Card className="border-l-4 border-l-primary shadow-sm bg-muted/20">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">
              Previous Remarks
            </h4>
            <p className="text-sm leading-relaxed">
              {placement.coordinator_remarks}
            </p>
          </CardContent>
        </Card>
      )}

      {placement.status === "pending" && (
        <PlacementReviewAction {...reviewData} />
      )}
    </div>
  );
}
