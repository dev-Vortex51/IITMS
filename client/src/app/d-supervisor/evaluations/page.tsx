"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import {
  EmptyState,
  FilterBar,
  FilterFieldSearch,
  FilterFieldSelect,
  LoadingTableSkeleton,
  PageHeader,
  StatRingCard,
  StatsGrid,
  StatusBadge,
} from "@/components/design-system";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Plus, Eye, Calendar } from "lucide-react";

export default function EvaluationsPage() {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: evaluationsData, isLoading } = useQuery({
    queryKey: ["evaluations", user?.id, statusFilter],
    queryFn: async () => {
      return { data: [] };
    },
    enabled: !!user?.id,
  });

  const evaluations = evaluationsData?.data || [];

  const filteredEvaluations = evaluations.filter((evaluation: any) => {
    const searchLower = searchQuery.toLowerCase();
    const studentName = evaluation.student?.name?.toLowerCase() || "";
    const matricNumber = evaluation.student?.matricNumber?.toLowerCase() || "";
    return studentName.includes(searchLower) || matricNumber.includes(searchLower);
  });

  const completedCount = evaluations.filter(
    (e: any) => e.status === "completed" || e.status === "submitted",
  ).length;
  const draftCount = evaluations.filter((e: any) => e.status === "draft").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Evaluations"
        description="Create and manage student performance evaluations"
        actions={
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Evaluation
          </Button>
        }
      />

      <FilterBar>
        <FilterFieldSearch
          placeholder="Search evaluations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <FilterFieldSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
          options={[
            { label: "All Statuses", value: "all" },
            { label: "Draft", value: "draft" },
            { label: "Completed", value: "completed" },
            { label: "Submitted", value: "submitted" },
          ]}
          className="w-full md:w-[200px]"
        />
      </FilterBar>

      <StatsGrid className="lg:grid-cols-3">
        <StatRingCard
          label="Total Evaluations"
          value={evaluations.length}
          progress={100}
          color="blue"
          trend="up"
        />
        <StatRingCard
          label="Completed"
          value={completedCount}
          progress={evaluations.length > 0 ? Math.round((completedCount / evaluations.length) * 100) : 0}
          color="green"
          trend="up"
        />
        <StatRingCard
          label="Drafts"
          value={draftCount}
          progress={evaluations.length > 0 ? Math.round((draftCount / evaluations.length) * 100) : 0}
          color="yellow"
          trend={draftCount > 0 ? "down" : "up"}
        />
      </StatsGrid>

      {isLoading ? (
        <LoadingTableSkeleton />
      ) : filteredEvaluations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Evaluations ({filteredEvaluations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEvaluations.map((evaluation: any) => (
                <div
                  key={evaluation.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/5"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <ClipboardCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {evaluation.student?.name || "Unknown Student"}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          ({evaluation.student?.matricNumber || "N/A"})
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {evaluation.createdAt
                            ? new Date(evaluation.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                        {evaluation.totalScore !== undefined ? (
                          <span>Score: {evaluation.totalScore}%</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={evaluation.status || "draft"} />
                    <Button variant="outline" size="sm" disabled>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title={
                searchQuery || statusFilter !== "all"
                  ? "No Evaluations Found"
                  : "No Evaluations Yet"
              }
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first evaluation to get started."
              }
              icon={<ClipboardCheck className="h-6 w-6 text-accent-foreground" />}
              actionLabel="Create First Evaluation"
              onAction={() => {}}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Guidelines</CardTitle>
          <CardDescription>
            Important information about student evaluations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">-</div>
              <p>Evaluations should be completed at mid-term and end of SIWES program</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">-</div>
              <p>
                Assess students based on technical skills, professionalism, and
                work attitude
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">-</div>
              <p>Provide constructive feedback to help students improve</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">-</div>
              <p>
                Submit evaluations before the deadline to ensure timely processing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
