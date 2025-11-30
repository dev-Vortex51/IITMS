"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoadingCard } from "@/components/ui/loading";
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
  Award,
} from "lucide-react";

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch assessments created by this supervisor
  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ["assessments", user?._id, statusFilter],
    queryFn: async () => {
      // This would fetch assessments from the API
      // For now, return mock data
      return { data: [] };
    },
    enabled: !!user?._id,
  });

  const assessments = assessmentsData?.data || [];

  // Filter assessments based on search query
  const filteredAssessments = assessments.filter((assessment: any) => {
    const searchLower = searchQuery.toLowerCase();
    const studentName = assessment.student?.name?.toLowerCase() || "";
    const matricNumber = assessment.student?.matricNumber?.toLowerCase() || "";

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

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "success" as const, label: "Excellent" };
    if (score >= 70) return { variant: "success" as const, label: "Very Good" };
    if (score >= 60) return { variant: "warning" as const, label: "Good" };
    if (score >= 50) return { variant: "warning" as const, label: "Fair" };
    return { variant: "destructive" as const, label: "Poor" };
  };

  const completedCount = assessments.filter(
    (a: any) => a.status === "completed" || a.status === "submitted"
  ).length;
  const draftCount = assessments.filter(
    (a: any) => a.status === "draft"
  ).length;
  const avgScore =
    assessments.length > 0
      ? Math.round(
          assessments.reduce(
            (sum: number, a: any) => sum + (a.totalScore || 0),
            0
          ) / assessments.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Student Assessments
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage workplace performance assessments
          </p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Assessments</CardTitle>
          <CardDescription>
            Find assessments by student name or matric number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
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
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {assessments.length}
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
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {avgScore}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      {isLoading ? (
        <LoadingCard />
      ) : filteredAssessments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Assessments ({filteredAssessments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAssessments.map((assessment: any) => {
                const statusConfig = getStatusBadge(assessment.status);
                const scoreConfig = getScoreBadge(assessment.totalScore || 0);

                return (
                  <div
                    key={assessment._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ClipboardCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {assessment.student?.name || "Unknown Student"}
                          </p>
                          <span className="text-muted-foreground text-sm">
                            ({assessment.student?.matricNumber || "N/A"})
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {assessment.createdAt
                              ? new Date(
                                  assessment.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                          {assessment.totalScore !== undefined && (
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Score: {assessment.totalScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {assessment.totalScore !== undefined && (
                        <Badge
                          variant={scoreConfig.variant}
                          className="min-w-[80px] justify-center"
                        >
                          {scoreConfig.label}
                        </Badge>
                      )}
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
                    ? "No Assessments Found"
                    : "No Assessments Yet"}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first assessment to evaluate student performance"}
                </p>
              </div>
              <Button disabled>
                <Plus className="h-4 w-4 mr-2" />
                Create First Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Guidelines</CardTitle>
          <CardDescription>
            Important information about workplace assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p>
                Assess students based on their workplace performance, technical
                skills, and professionalism
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p>
                Provide honest and constructive feedback to help students
                improve
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p>
                Consider punctuality, ability to learn, initiative, and teamwork
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p>
                Complete assessments before the program end date for timely
                grading
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p>
                Contact the coordinator if you have questions about the
                assessment criteria
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
