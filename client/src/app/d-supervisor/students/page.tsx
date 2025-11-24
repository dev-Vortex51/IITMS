"use client";

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
  Users,
  Search,
  Eye,
  Briefcase,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DSupervisorStudentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch assigned students (students where this user is the departmental supervisor)
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["assigned-students", user?._id],
    queryFn: async () => {
      // This would fetch students assigned to this supervisor
      // For now, we'll use a mock response
      return { data: [] };
    },
    enabled: !!user?._id,
  });

  const students = studentsData?.data || [];

  // Filter students based on search query
  const filteredStudents = students.filter((student: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.matricNumber?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  const getPlacementStatus = (student: any) => {
    if (!student.placement) {
      return { text: "No Placement", variant: "secondary" as const };
    }
    const status = student.placement.status || "pending";
    const variants = {
      approved: { text: "Approved", variant: "success" as const },
      pending: { text: "Pending", variant: "warning" as const },
      rejected: { text: "Rejected", variant: "destructive" as const },
    };
    return (
      variants[status as keyof typeof variants] || {
        text: "Unknown",
        variant: "secondary" as const,
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Students</h1>
          <p className="text-muted-foreground mt-2">
            Students under your supervision
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
      <div className="grid gap-4 md:grid-cols-4">
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
                students.filter((s: any) => s.placement?.status === "approved")
                  .length
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
              <span className="text-2xl font-bold text-yellow-600">0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      {isLoading ? (
        <div>Loading students...</div>
      ) : filteredStudents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Students List ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredStudents.map((student: any) => {
                const placementStatus = getPlacementStatus(student);
                const logbookCount = student.logbookEntries?.length || 0;

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
                        <p className="font-medium">{student.name || "N/A"}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {student.matricNumber || "N/A"}
                          </p>
                          {student.placement?.companyName && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground">
                                {student.placement.companyName}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <BookOpen className="h-3 w-3" />
                          {logbookCount} entries
                        </Badge>
                        <Badge variant={placementStatus.variant}>
                          {placementStatus.text}
                        </Badge>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/d-supervisor/students/${student._id}`}>
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
