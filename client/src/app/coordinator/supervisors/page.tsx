"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/admin.service";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Building,
  Building2,
  Search,
  Eye,
  Mail,
  Users,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function SupervisorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("departmental");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all supervisors
  const {
    data: supervisorsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["supervisors"],
    queryFn: async () => {
      const result = await adminService.supervisorService.getAllSupervisors();
      console.log("Supervisors API response:", result);
      return result;
    },
  });

  // Create supervisor mutation
  const createSupervisorMutation = useMutation({
    mutationFn: (data: any) =>
      adminService.supervisorService.createSupervisor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      queryClient.refetchQueries({ queryKey: ["supervisors"] });
      setIsCreateDialogOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialization: "",
      });
      toast.success("Departmental supervisor created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create supervisor";
      console.error("Create supervisor error:", error.response?.data);
      toast.error(errorMessage);
    },
  });

  const handleCreateSupervisor = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.department) {
      toast.error("Department information is missing");
      return;
    }

    createSupervisorMutation.mutate({
      ...formData,
      role: "departmental_supervisor",
      department:
        typeof user.department === "object"
          ? (user.department as any)._id
          : user.department,
    });
  };

  const allSupervisors = supervisorsData?.data || [];

  // Debug: log supervisors to see what we're getting
  console.log("All supervisors:", allSupervisors);

  // Split by type (you may need to check if your API differentiates types)
  const departmentalSupervisors = allSupervisors.filter(
    (s: any) => s.type === "departmental" || s.department
  );
  const industrialSupervisors = allSupervisors.filter(
    (s: any) => s.type === "industrial" || s.companyName
  );

  console.log("Departmental supervisors:", departmentalSupervisors);
  console.log("Industrial supervisors:", industrialSupervisors);

  // Filter supervisors based on search query
  const filterSupervisors = (supervisors: any[]) => {
    return supervisors.filter((supervisor: any) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        supervisor.name?.toLowerCase().includes(searchLower) ||
        supervisor.email?.toLowerCase().includes(searchLower) ||
        supervisor.department?.name?.toLowerCase().includes(searchLower) ||
        supervisor.companyName?.toLowerCase().includes(searchLower)
      );
    });
  };

  const filteredDepartmental = filterSupervisors(departmentalSupervisors);
  const filteredIndustrial = filterSupervisors(industrialSupervisors);

  const renderSupervisorCard = (
    supervisor: any,
    type: "departmental" | "industrial"
  ) => (
    <Card
      key={supervisor._id}
      className="hover:shadow-md transition-shadow h-full flex flex-col"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                type === "departmental" ? "bg-primary/10" : "bg-accent/10"
              }`}
            >
              {type === "departmental" ? (
                <Building className="h-5 w-5 text-primary" />
              ) : (
                <Building2 className="h-5 w-5 text-accent-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {supervisor.name || "N/A"}
              </CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground truncate">
                  {supervisor.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <Badge
            variant={supervisor.status === "active" ? "default" : "secondary"}
            className="shrink-0"
          >
            {supervisor.status || "Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          {type === "departmental" ? (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground shrink-0">
                Department:
              </span>
              <span className="font-medium truncate">
                {typeof supervisor.department === "object"
                  ? supervisor.department.name
                  : supervisor.department || "N/A"}
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground shrink-0">Company:</span>
              <span className="font-medium break-words min-w-0">
                {supervisor.companyName || "N/A"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Students Assigned:</span>
            <span className="font-medium">
              {supervisor.students?.length || 0}
            </span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={`/coordinator/supervisors/${supervisor._id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Supervisors</h1>
          <p className="text-muted-foreground mt-2">
            Manage departmental and industrial supervisors
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Departmental Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Departmental Supervisor</DialogTitle>
              <DialogDescription>
                Create a new departmental supervisor to assign to students
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSupervisor}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="supervisor@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="Enter area of specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSupervisorMutation.isPending}
                >
                  {createSupervisorMutation.isPending
                    ? "Creating..."
                    : "Create Supervisor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Supervisors</CardTitle>
          <CardDescription>
            Find supervisors by name, email, department, or company
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
                {allSupervisors.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departmental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {departmentalSupervisors.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Industrial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent-foreground" />
              <span className="text-2xl font-bold text-primary">
                {industrialSupervisors.length}
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
              {allSupervisors.filter((s: any) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supervisors List with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="departmental">
            Departmental ({departmentalSupervisors.length})
          </TabsTrigger>
          <TabsTrigger value="industrial">
            Industrial ({industrialSupervisors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departmental" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Loading supervisors...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : filteredDepartmental.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  No Departmental Supervisors
                </h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery
                    ? "No supervisors match your search criteria"
                    : "Departmental supervisors will appear here once registered"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDepartmental.map((supervisor) =>
                renderSupervisorCard(supervisor, "departmental")
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="industrial" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Loading supervisors...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : filteredIndustrial.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  No Industrial Supervisors
                </h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery
                    ? "No supervisors match your search criteria"
                    : "Industrial supervisors will appear here once registered"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIndustrial.map((supervisor) =>
                renderSupervisorCard(supervisor, "industrial")
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
