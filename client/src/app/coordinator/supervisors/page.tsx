"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useSupervisors } from "./hooks/useSupervisors";
import { SupervisorMetrics } from "./components/SupervisorMetrics";
import { SupervisorCard } from "./components/SupervisorCard";
import { CreateSupervisorDialog } from "./components/CreateSupervisorDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Users2 } from "lucide-react";

export default function SupervisorsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("academic");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    academicSupervisors,
    industrialSupervisors,
    stats,
    isLoading,
    createSupervisor,
    isCreating,
  } = useSupervisors(user);

  const filterList = (list: any[]) =>
    list.filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.department?.name?.toLowerCase().includes(q) ||
        s.companyName?.toLowerCase().includes(q)
      );
    });

  const displayAcademic = filterList(academicSupervisors);
  const displayIndustrial = filterList(industrialSupervisors);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Supervisors Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage academic and industrial partners for your department.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Industrial Supervisor
        </Button>
      </div>

      <SupervisorMetrics stats={stats} />

      {/* Tabs & Toolbar Layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-2 rounded-lg border border-border/50 shadow-sm">
          <TabsList className="w-full sm:w-auto grid grid-cols-2">
            <TabsTrigger value="academic">
              Academic ({stats.academic})
            </TabsTrigger>
            <TabsTrigger value="industrial">
              Industrial ({stats.industrial})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background"
            />
          </div>
        </div>

        {/* Content Views */}
        <TabsContent value="academic">
          <SupervisorGrid
            isLoading={isLoading}
            data={displayAcademic}
            type="academic"
            emptyMessage="No academic supervisors found."
          />
        </TabsContent>

        <TabsContent value="industrial">
          <SupervisorGrid
            isLoading={isLoading}
            data={displayIndustrial}
            type="industrial"
            emptyMessage="No industrial supervisors found."
          />
        </TabsContent>
      </Tabs>

      <CreateSupervisorDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={createSupervisor}
        isPending={isCreating}
      />
    </div>
  );
}

// Internal helper for grid rendering
function SupervisorGrid({ isLoading, data, type, emptyMessage }: any) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading directory...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-muted/10">
        <Users2 className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
      {data.map((supervisor: any) => (
        <SupervisorCard
          key={supervisor.id}
          supervisor={supervisor}
          type={type}
        />
      ))}
    </div>
  );
}
