"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ErrorLocalState,
  LoadingPage,
  PageHeader,
} from "@/components/design-system";
import { PlacementFormDialog } from "./components/PlacementFormDialog";
import { PlacementStatusCard } from "./components/PlacementStatusCard";
import { PlacementCompanySection } from "./components/PlacementCompanySection";
import { PlacementSupervisorSection } from "./components/PlacementSupervisorSection";
import { PlacementRemarksSection } from "./components/PlacementRemarksSection";
import { PlacementEmptyState } from "./components/PlacementEmptyState";
import { useStudentPlacement } from "./hooks/useStudentPlacement";
import { toast } from "sonner";

export default function StudentPlacementPage() {
  useEffect(() => {
    document.title = "Placement | ITMS";
  }, []);

  const {
    placement,
    isDialogOpen,
    setIsDialogOpen,
    formData,
    setFormData,
    openEditDialog,
    openNewDialog,
    createMutation,
    updateMutation,
    withdrawMutation,
    buildCreatePayload,
    buildUpdatePayload,
    isLoadingStudent,
    isLoadingPlacement,
    isErrorStudent,
    isErrorPlacement,
    refetchStudent,
    refetchPlacement,
  } = useStudentPlacement();

  const handleCreate = () => {
    const createPayload = buildCreatePayload();
    if (!createPayload) {
      toast.error("Student information not found. Please refresh.");
      return;
    }
    createMutation.mutate(createPayload);
  };

  const handleUpdate = () => {
    updateMutation.mutate(buildUpdatePayload());
  };

  if (isLoadingStudent || isLoadingPlacement) {
    return <LoadingPage label="Loading placement..." />;
  }

  if (isErrorStudent || isErrorPlacement) {
    return (
      <div className="space-y-4 md:space-y-5 max-w-5xl">
        <PageHeader
          title="Industrial Placement"
          description="Manage your industrial training placement information."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/student/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          }
        />
        <ErrorLocalState
          message="Placement data could not be loaded."
          onRetry={() => {
            refetchStudent();
            refetchPlacement();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 max-w-5xl">
      <PageHeader
        title="Industrial Placement"
        description="Manage your industrial training placement information."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/student/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        }
      />

      <PlacementFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        placementStatus={placement?.status}
        formData={formData}
        setFormData={setFormData}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isCreating={createMutation.isPending}
        isUpdating={updateMutation.isPending}
      />

      {placement ? (
        <div className="space-y-4 md:space-y-5">
          <PlacementStatusCard
            placement={placement}
            onEdit={openEditDialog}
            onWithdraw={() => withdrawMutation.mutate()}
            onStartNew={openNewDialog}
            isUpdating={updateMutation.isPending}
            isWithdrawing={withdrawMutation.isPending}
            isCreating={createMutation.isPending}
          />
          <PlacementCompanySection placement={placement} />
          <PlacementSupervisorSection placement={placement} />
          <PlacementRemarksSection placement={placement} />
        </div>
      ) : (
        <PlacementEmptyState onStartNew={openNewDialog} />
      )}
    </div>
  );
}
