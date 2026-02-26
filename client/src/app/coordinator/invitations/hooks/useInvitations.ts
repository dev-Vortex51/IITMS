import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import invitationService from "@/services/invitation.service";
import { toast } from "sonner";

export function useInvitations(statusFilter: string) {
  const queryClient = useQueryClient();

  const { data: invitationsData, isLoading } = useQuery({
    queryKey: ["invitations", statusFilter],
    queryFn: () => {
      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      return invitationService.getInvitations(filters);
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ["invitation-stats"],
    queryFn: () => invitationService.getStatistics(),
  });

  const createMutation = useMutation({
    mutationFn: invitationService.createInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["invitation-stats"] });
      toast.success("Invitation sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => invitationService.resendInvitation(id),
    onSuccess: () => {
      toast.success("Invitation resent successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resend");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => invitationService.cancelInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["invitation-stats"] });
      toast.success("Invitation cancelled");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel");
    },
  });

  return {
    invitations: invitationsData?.data || [],
    stats: statsData?.data || {
      total: 0,
      pending: 0,
      accepted: 0,
      expired: 0,
      cancelled: 0,
    },
    isLoading,
    createInvitation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    resendInvitation: resendMutation.mutate,
    isResending: resendMutation.isPending,
    cancelInvitation: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
  };
}
