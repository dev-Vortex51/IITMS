"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Users,
  School,
  Search,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    faculty: "",
  });
  const [error, setError] = useState("");

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [selectedFaculty, setSelectedFaculty] = useState(
    searchParams.get("faculty") || "all"
  );
  const itemsPerPage = 12;

  // Update URL when search/pagination changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (selectedFaculty && selectedFaculty !== "all")
      params.set("faculty", selectedFaculty);

    const newUrl = `${pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.replace(newUrl, { scroll: false });
  }, [searchTerm, currentPage, selectedFaculty, pathname, router]);

  // Fetch departments with pagination and search
  const {
    data: departmentsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["departments", currentPage, searchTerm, selectedFaculty],
    queryFn: () => {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (
        selectedFaculty &&
        selectedFaculty !== "all" &&
        selectedFaculty !== ""
      ) {
        params.faculty = selectedFaculty;
      }
      return adminService.departmentService.getAllDepartments(params);
    },
  });

  // Fetch all faculties for dropdown
  const { data: facultiesData } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => adminService.facultyService.getAllFaculties(),
  });

  // Fetch available coordinators for the selected department
  const { data: coordinatorsData } = useQuery({
    queryKey: ["department-coordinators", selectedDepartment?._id],
    queryFn: () =>
      selectedDepartment
        ? adminService.departmentService.getAvailableCoordinatorsForDepartment(
            selectedDepartment._id
          )
        : Promise.resolve({ data: [] }),
    enabled: !!selectedDepartment?._id,
  });

  // Get coordinators for the selected department
  const getAvailableCoordinators = () => {
    return coordinatorsData?.data || [];
  };

  const departments = departmentsData?.data || [];
  const faculties = facultiesData?.data || [];

  // Handle backend meta structure
  const meta = departmentsData?.meta || {};
  const totalCount = meta.totalItems || meta.totalCount || departments.length;

  const totalPages = meta.totalPages || Math.ceil(totalCount / itemsPerPage);

  // Pagination hook
  const paginationItems = usePagination({
    currentPage,
    totalPages,
    siblingCount: 1,
  });

  // Handlers for search and pagination
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFacultyChange = (value: string) => {
    setSelectedFaculty(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Create department mutation
  const createMutation = useMutation({
    mutationFn: (data: any) =>
      adminService.departmentService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setFormData({ name: "", code: "", faculty: "" });
      setError("");
      setIsCreateDialogOpen(false);
      toast.success("Department created successfully");
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to create department";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminService.departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete department";
      toast.error(errorMessage);
    },
  });

  // Assign coordinator mutation
  const assignCoordinatorMutation = useMutation({
    mutationFn: ({
      departmentId,
      coordinatorId,
    }: {
      departmentId: string;
      coordinatorId: string;
    }) =>
      adminService.departmentService.assignCoordinator(
        departmentId,
        coordinatorId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsAssignDialogOpen(false);
      setSelectedDepartment(null);
      setSelectedCoordinator("");
      setError("");
      toast.success("Coordinator assigned successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to assign coordinator";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.faculty) {
      setError("Please select a faculty");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssignCoordinator = (department: any) => {
    setSelectedDepartment(department);
    setIsAssignDialogOpen(true);
  };

  const handleAssignSubmit = () => {
    if (selectedDepartment && selectedCoordinator) {
      assignCoordinatorMutation.mutate({
        departmentId: selectedDepartment._id,
        coordinatorId: selectedCoordinator,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
            Departments
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage departments across all faculties
            {totalCount > 0 && (
              <span className="block mt-1 sm:inline sm:ml-2 sm:mt-0">
                ({totalCount} departments)
              </span>
            )}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Department</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to a faculty
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Department Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                  placeholder="e.g., CSC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty *</Label>
                <Select
                  value={formData.faculty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, faculty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty: any) => (
                      <SelectItem key={faculty._id} value={faculty._id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create Department"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search departments by name or code..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-64">
              <Select
                value={selectedFaculty}
                onValueChange={handleFacultyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {faculties.map((faculty: any) => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || selectedFaculty) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedFaculty("all");
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Departments Grid */}
      {queryError && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-destructive">
                  Error Loading Departments
                </h3>
                <p className="text-muted-foreground mt-1">
                  {queryError?.message || "Failed to load departments"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!queryError && isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">
                  Loading departments...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !queryError && departments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((department: any) => (
            <Card
              key={department._id}
              className="hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Building className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {department.name}
                      </CardTitle>
                      <CardDescription>Code: {department.code}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <School className="h-3 w-3" />
                      Faculty
                    </Label>
                    <p className="font-medium">
                      {typeof department.faculty === "object"
                        ? department.faculty.name
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Coordinator
                    </Label>
                    <div className="flex items-center justify-between min-h-[24px]">
                      <p
                        className={`font-medium ${
                          !department.coordinators ||
                          department.coordinators.length === 0
                            ? "text-muted-foreground"
                            : ""
                        }`}
                      >
                        {department.coordinators &&
                        department.coordinators.length > 0
                          ? department.coordinators.length === 1
                            ? "Coordinator Assigned"
                            : `${department.coordinators.length} Coordinators`
                          : "Not assigned"}
                      </p>
                      <Button
                        variant={
                          department.coordinators &&
                          department.coordinators.length > 0
                            ? "ghost"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleAssignCoordinator(department)}
                        className="text-xs h-6 px-2"
                      >
                        {department.coordinators &&
                        department.coordinators.length > 0 ? (
                          "Change"
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Assign
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{department.studentCount || 0} students</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/admin/departments/${department._id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDelete(department._id, department.name)
                    }
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !queryError ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {searchTerm || (selectedFaculty && selectedFaculty !== "all")
                    ? "No Departments Found"
                    : "No Departments Yet"}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm || (selectedFaculty && selectedFaculty !== "all")
                    ? "No departments match your search criteria. Try adjusting your filters."
                    : "Create your first department to get started"}
                </p>
                {(searchTerm ||
                  (selectedFaculty && selectedFaculty !== "all")) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedFaculty("all");
                      setCurrentPage(1);
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {paginationItems.map((item, index) => {
                if (item.type === "previous") {
                  return (
                    <PaginationItem key={index}>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          item.disabled
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  );
                }

                if (item.type === "next") {
                  return (
                    <PaginationItem key={index}>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          item.disabled
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  );
                }

                if (item.type === "ellipsis") {
                  return (
                    <PaginationItem key={index}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => handlePageChange(item.page!)}
                      isActive={item.isActive}
                      className="cursor-pointer"
                    >
                      {item.page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Assign Coordinator Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Coordinator</DialogTitle>
            <DialogDescription>
              {selectedDepartment
                ? `Assign a coordinator to ${selectedDepartment.name}. Only coordinators from this department or unassigned coordinators are eligible.`
                : "Select a coordinator for the department"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="coordinator">Select Coordinator</Label>
              <Select
                value={selectedCoordinator}
                onValueChange={setSelectedCoordinator}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a coordinator" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCoordinators()?.map((coordinator: any) => (
                    <SelectItem key={coordinator._id} value={coordinator._id}>
                      {coordinator.firstName} {coordinator.lastName} (
                      {coordinator.email})
                      {coordinator.department
                        ? " - Currently Assigned"
                        : " - Available"}
                    </SelectItem>
                  ))}
                  {getAvailableCoordinators()?.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No available coordinators for this department.
                      Coordinators can only be assigned to their own department.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAssignSubmit}
                disabled={
                  !selectedCoordinator || assignCoordinatorMutation.isPending
                }
                className="flex-1"
              >
                {assignCoordinatorMutation.isPending
                  ? "Assigning..."
                  : "Assign Coordinator"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setSelectedDepartment(null);
                  setSelectedCoordinator("");
                  setError("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
