import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService, placementService } from "@/services/student.service";
import { toast } from "sonner";

export function usePlacementReview(studentId: string) {
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  // Fetch student placement
  const { data: placement, isLoading } = useQuery({
    queryKey: ["placement", studentId],
    queryFn: () => studentService.getStudentPlacement(studentId),
    enabled: !!studentId,
  });

  // Approve placement mutation
  const approveMutation = useMutation({
    mutationFn: (data: { remarks?: string }) =>
      placement
        ? placementService.approvePlacement(placement.id, data.remarks || "")
        : Promise.reject("No placement"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement", studentId] });
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      setRemarks("");
      setError("");
      toast.success("Placement approved successfully");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to approve placement");
      toast.error("Failed to approve placement");
    },
  });

  // Reject placement mutation
  const rejectMutation = useMutation({
    mutationFn: (data: { remarks: string }) =>
      placement
        ? placementService.rejectPlacement(placement.id, data.remarks)
        : Promise.reject("No placement"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement", studentId] });
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      setRemarks("");
      setError("");
      toast.success("Placement rejected successfully");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to reject placement");
      toast.error("Failed to reject placement");
    },
  });

  const handleApprove = () => {
    if (window.confirm("Are you sure you want to approve this placement?")) {
      approveMutation.mutate({ remarks });
    }
  };

  const handleReject = () => {
    if (!remarks.trim()) {
      setError("Please provide remarks for rejection");
      return;
    }
    if (window.confirm("Are you sure you want to reject this placement?")) {
      rejectMutation.mutate({ remarks });
    }
  };

  return {
    placement,
    isLoading,
    remarks,
    setRemarks,
    error,
    handleApprove,
    handleReject,
    isPending: approveMutation.isPending || rejectMutation.isPending,
  };
}
