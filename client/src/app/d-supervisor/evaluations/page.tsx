"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheck,
  Search,
  Plus,
  Eye,
  Calendar,
  Users,
} from "lucide-react";

export default function EvaluationsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch evaluations created by this supervisor
  const { data: evaluationsData, isLoading } = useQuery({
    queryKey: ["evaluations", user?._id, statusFilter],
    queryFn: async () => {
      // This would fetch evaluations from the API
      // For now, return mock data
      return { data: [] };
    },
    enabled: !!user?._id,
  });

  const evaluations = evaluationsData?.data || [];

  // Filter evaluations based on search query
  const filteredEvaluations = evaluations.filter((evaluation: any) => {
    const searchLower = searchQuery.toLowerCase();
    const studentName = evaluation.student?.name?.toLowerCase() || "";
    const matricNumber = evaluation.student?.matricNumber?.toLowerCase() || "";

    return (
      studentName.includes(searchLower) || matricNumber.includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      completed: { variant: "success" as const, text: "Completed" },
      draft: { variant: "secondary" as const, text: "Draft" },
      submitted: { variant: "success" as const, text: "Submitted" },
    };
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const completedCount = evaluations.filter(
    (e: any) => e.status === "completed" || e.status === "submitted"
  ).length;
  const draftCount = evaluations.filter(
    (e: any) => e.status === "draft"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Student Evaluations
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage student performance evaluations
          </p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          New Evaluation
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Evaluations</CardTitle>
          <CardDescription>
            Find evaluations by student name or matric number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search evaluations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {evaluations.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {draftCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">--</div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluations List */}
      {isLoading ? (
        <div>Loading evaluations...</div>
      ) : filteredEvaluations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Evaluations ({filteredEvaluations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEvaluations.map((evaluation: any) => {
                const statusConfig = getStatusBadge(evaluation.status);

                return (
                  <div
                    key={evaluation._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ClipboardCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {evaluation.student?.name || "Unknown Student"}
                          </p>
                          <span className="text-muted-foreground text-sm">
                            ({evaluation.student?.matricNumber || "N/A"})
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {evaluation.createdAt
                              ? new Date(
                                  evaluation.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                          {evaluation.totalScore !== undefined && (
                            <span>Score: {evaluation.totalScore}%</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.text}
                      </Badge>
                      <Button variant="outline" size="sm" disabled>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {searchQuery || statusFilter !== "all"
                    ? "No Evaluations Found"
                    : "No Evaluations Yet"}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first evaluation to get started"}
                </p>
              </div>
              <Button disabled>
                <Plus className="h-4 w-4 mr-2" />
                Create First Evaluation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Guidelines */}
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
              <div className="mt-0.5">•</div>
              <p>
                Evaluations should be completed at mid-term and end of SIWES
                program
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p>
                Assess students based on technical skills, professionalism, and
                work attitude
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p>Provide constructive feedback to help students improve</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p>
                Submit evaluations before the deadline to ensure timely
                processing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
