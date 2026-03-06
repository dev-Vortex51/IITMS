"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { useSupervisors } from "./hooks/useSupervisors";
import { SupervisorMetrics } from "./components/SupervisorMetrics";
import { SupervisorsTable } from "./components/SupervisorsTable";
import { SupervisorFilters } from "./components/SupervisorFilters";
import { CreateSupervisorDialog } from "./components/CreateSupervisorDialog";
import { LoadingPage, PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SupervisorsPage() {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [activeTab, setActiveTab] = useState("academic");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    academicSupervisors,
    industrialSupervisors,
    stats,
    isLoading,
    createSupervisor,
    isCreating,
  } = useSupervisors(user);

  const filterList = (list: any[]) => {
    return list.filter((s) => {
      const q = searchQuery.toLowerCase();
      const statusMatches = statusFilter === "all" || s.status === statusFilter;
      const searchMatches =
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.department?.name?.toLowerCase().includes(q) ||
        s.companyName?.toLowerCase().includes(q);
      return (
        statusMatches && searchMatches
      );
    });
  };

  const displayAcademic = filterList(academicSupervisors);
  const displayIndustrial = filterList(industrialSupervisors);

  if (isLoading) {
    return <LoadingPage label="Loading supervisors..." />;
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Supervisors Directory"
        description="Manage academic and industrial partners for your department."
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Industrial Supervisor
          </Button>
        }
      />

      <SupervisorMetrics stats={stats} />

      <SupervisorFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        academicCount={stats.academic}
        industrialCount={stats.industrial}
      />

      <SupervisorsTable
        supervisors={activeTab === "academic" ? displayAcademic : displayIndustrial}
        isLoading={isLoading}
        type={activeTab as "academic" | "industrial"}
      />

      <CreateSupervisorDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={createSupervisor}
        isPending={isCreating}
      />
    </div>
  );
}
