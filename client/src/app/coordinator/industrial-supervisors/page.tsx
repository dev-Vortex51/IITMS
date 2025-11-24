"use client";

import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
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
import { Users, Search, Eye, Mail, Building2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function IndustrialSupervisorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all industrial supervisors
  const { data: supervisorsData, isLoading } = useQuery({
    queryKey: ["industrial-supervisors"],
    queryFn: () => adminService.supervisorService.getAllSupervisors(),
  });

  const supervisors = supervisorsData?.data || [];

  // Filter supervisors based on search query
  const filteredSupervisors = supervisors.filter((supervisor: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      supervisor.name?.toLowerCase().includes(searchLower) ||
      supervisor.email?.toLowerCase().includes(searchLower) ||
      supervisor.companyName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Industrial Supervisors
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage industrial supervisors and their company assignments
          </p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Supervisor
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Supervisors</CardTitle>
          <CardDescription>
            Find supervisors by name, email, or company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search supervisors..."
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
              Total Supervisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {supervisors.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {supervisors.filter((s: any) => s.isActive !== false).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {supervisors.filter((s: any) => s.students?.length > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground">
              {
                new Set(
                  supervisors.map((s: any) => s.companyName).filter(Boolean)
                ).size
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supervisors List */}
      {isLoading ? (
        <div>Loading supervisors...</div>
      ) : filteredSupervisors.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Supervisors List ({filteredSupervisors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSupervisors.map((supervisor: any) => {
                const studentCount = supervisor.students?.length || 0;

                return (
                  <div
                    key={supervisor._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {supervisor.name || "N/A"}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {supervisor.email || "N/A"}
                          </p>
                          {supervisor.companyName && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {supervisor.companyName}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {studentCount}{" "}
                          {studentCount === 1 ? "Student" : "Students"}
                        </Badge>
                        <Badge
                          variant={
                            supervisor.isActive !== false
                              ? "success"
                              : "secondary"
                          }
                        >
                          {supervisor.isActive !== false
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/coordinator/industrial-supervisors/${supervisor._id}`}
                        >
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
                  {searchQuery ? "No Supervisors Found" : "No Supervisors Yet"}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Industrial supervisors will appear here once added"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
