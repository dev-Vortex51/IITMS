"use client";

import { useState } from "react";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { useInvitations } from "./hooks/useInvitations";
import { CreateInvitationDialog } from "./components/CreateInvitationDialog";
import { InvitationStats } from "@/app/admin/invitations/components/InvitationStats";
import { InvitationFilters } from "@/app/admin/invitations/components/InvitationFilters";
import { InvitationsTable } from "@/app/admin/invitations/components/InvitationsTable";
import { InvitationsHeader } from "@/app/admin/invitations/components/InvitationsHeader";

type CoordinatorInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
};

export default function CoordinatorInvitationsPage() {
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    invitations,
    stats,
    isLoading,
    createInvitation,
    isCreating,
    resendInvitation,
    isResending,
    cancelInvitation,
    isCancelling,
  } = useInvitations(statusFilter);

  const filteredInvitations = (invitations as CoordinatorInvitation[]).filter((inv) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      inv.email.toLowerCase().includes(query) ||
      inv.role.toLowerCase().includes(query);
    const matchesRole = roleFilter === "all" || inv.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 md:space-y-5">
      <InvitationsHeader onOpenCreate={() => setIsCreateDialogOpen(true)} />

      <CreateInvitationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={createInvitation}
        isPending={isCreating}
      />

      <InvitationStats stats={stats} />

      <InvitationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        roleOptions={[
          { label: "All Roles", value: "all" },
          { label: "Student", value: "student" },
          { label: "Industrial Supervisor", value: "industrial_supervisor" },
        ]}
      />

      <InvitationsTable
        invitations={filteredInvitations}
        isLoading={isLoading}
        onResend={resendInvitation}
        onCancel={cancelInvitation}
        isResending={isResending}
        isCancelling={isCancelling}
      />
    </div>
  );
}
