"use client";

import { InvitationCreateDialog } from "./components/InvitationCreateDialog";
import { InvitationFilters } from "./components/InvitationFilters";
import { InvitationsHeader } from "./components/InvitationsHeader";
import { InvitationStats } from "./components/InvitationStats";
import { InvitationsTable } from "./components/InvitationsTable";
import { useAdminInvitations } from "./hooks/useAdminInvitations";

export default function AdminInvitationsPage() {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    formData,
    setFormData,
    filteredInvitations,
    stats,
    departments,
    createInvitation,
    resendInvitation,
    cancelInvitation,
    isLoading,
    isCreating,
    isResending,
    isCancelling,
  } = useAdminInvitations();

  return (
    <div className="space-y-4 md:space-y-5">
      <InvitationsHeader onOpenCreate={() => setIsCreateDialogOpen(true)} />

      <InvitationCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        departments={departments}
        onSubmit={createInvitation}
        isCreating={isCreating}
      />

      <InvitationStats stats={stats} />

      <InvitationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
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
