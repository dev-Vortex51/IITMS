"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentService, placementService } from "@/services/student.service";
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
  Briefcase,
  Search,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function CoordinatorPlacementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch all placements
  const { data: placementsData, isLoading } = useQuery({
    queryKey: ["placements", statusFilter],
    queryFn: () => {
      const filters = statusFilter !== "all" ? { status: statusFilter } : {};
      return placementService.getAllPlacements(filters);
    },
  });

  const placements = placementsData?.data || [];

  // Filter placements based on search query
  const filteredPlacements = placements.filter((placement: any) => {
    const searchLower = searchQuery.toLowerCase();
    const studentName = placement.student?.name?.toLowerCase() || "";
    const companyName = placement.companyName?.toLowerCase() || "";
    const matricNumber = placement.student?.matricNumber?.toLowerCase() || "";

    return (
      studentName.includes(searchLower) ||
      companyName.includes(searchLower) ||
      matricNumber.includes(searchLower)
    );
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      approved: {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-50",
        variant: "success" as const,
        text: "Approved",
      },
      pending: {
        icon: Clock,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        variant: "warning" as const,
        text: "Pending",
      },
      rejected: {
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        variant: "destructive" as const,
        text: "Rejected",
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const approvedCount = placements.filter(
    (p: any) => p.status === "approved"
  ).length;
  const pendingCount = placements.filter(
    (p: any) => p.status === "pending"
  ).length;
  const rejectedCount = placements.filter(
    (p: any) => p.status === "rejected"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Student Placements
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and manage student placement applications
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Placements</CardTitle>
          <CardDescription>
            Find placements by student name, company, or matric number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search placements..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
              Total Placements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {placements.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {approvedCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">
                {rejectedCount}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placements List */}
      {isLoading ? (
        <div>Loading placements...</div>
      ) : filteredPlacements.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Placements ({filteredPlacements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPlacements.map((placement: any) => {
                const config = getStatusConfig(placement.status);
                const StatusIcon = config.icon;

                return (
                  <div
                    key={placement._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Briefcase className={`h-6 w-6 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {placement.student?.name || "Unknown Student"}
                          </p>
                          <span className="text-muted-foreground text-sm">
                            ({placement.student?.matricNumber || "N/A"})
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {placement.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(
                              placement.startDate
                            ).toLocaleDateString()}{" "}
                            - {new Date(placement.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        {placement.coordinator_remarks && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Remarks: {placement.coordinator_remarks}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.text}
                      </Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/coordinator/students/${placement.student?._id}/placement`}
                        >
                          Review
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
                <Briefcase className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {searchQuery || statusFilter !== "all"
                    ? "No Placements Found"
                    : "No Placements Yet"}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Placement applications will appear here once submitted"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
