"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { LoadingCard } from "@/components/ui/loading";
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
import { Users, Search, Eye, Building2, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ISupervisorStudentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const supervisorId = user?.profileData?._id;

  // Fetch supervisor dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["supervisor-dashboard", supervisorId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/supervisors/${supervisorId}/dashboard`
      );
      return response.data.data;
    },
    enabled: !!supervisorId,
  });

  const students = dashboardData?.supervisor?.assignedStudents || [];

  // Filter students based on search query
  const filteredStudents = students.filter((student: any) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName =
      `${student.user?.firstName} ${student.user?.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      student.matricNumber?.toLowerCase().includes(searchLower) ||
      student.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  const getPlacementStatus = (student: any) => {
    if (!student.currentPlacement) {
      return {
        text: "No Placement",
        variant: "secondary" as const,
        className: "",
      };
    }
    const status = student.currentPlacement.status || "pending";
    const variants = {
      approved: {
        text: "Approved",
        variant: "default" as const,
        className: "bg-green-500 hover:bg-green-600",
      },
      pending: {
        text: "Pending",
        variant: "secondary" as const,
        className: "bg-yellow-500 hover:bg-yellow-600",
      },
      rejected: {
        text: "Rejected",
        variant: "destructive" as const,
        className: "",
      },
    };
    return (
      variants[status as keyof typeof variants] || {
        text: "Unknown",
        variant: "secondary" as const,
        className: "",
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Students</h1>
          <p className="text-muted-foreground mt-2">
            Students under your workplace supervision
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
          <CardDescription>
            Find students by name, matric number, or email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {students.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Placements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                students.filter(
                  (s: any) => s.currentPlacement?.status === "approved"
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Logbooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">
                {dashboardData?.statistics?.pendingLogbooks || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      {isLoading ? (
        <LoadingCard />
      ) : filteredStudents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Students List ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredStudents.map((student: any) => {
                const placementStatus = getPlacementStatus(student);

                return (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {student.user?.firstName} {student.user?.lastName}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {student.matricNumber || "N/A"}
                          </p>
                          {student.currentPlacement?.companyName && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {student.currentPlacement.companyName}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={placementStatus.variant}
                        className={placementStatus.className}
                      >
                        {placementStatus.text}
                      </Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/i-supervisor/students/${student._id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
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
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {searchQuery ? "No Students Found" : "No Students Assigned"}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Students will appear here once assigned to you"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
