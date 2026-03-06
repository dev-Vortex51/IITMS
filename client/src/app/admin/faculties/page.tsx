"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Edit, School, Search, Trash2 } from "lucide-react";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import adminService from "@/services/admin.service";
import {
  ActionMenu,
  AtlassianTable,
  DashboardMetricsGrid,
  ErrorLocalState,
  LoadingPage,
  PageHeader,
  type AtlassianTableColumn,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateFacultyDialog } from "./components/CreateFacultyDialog";
export default function FacultiesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    dean: "",
  });

  const facultiesQuery = useQuery({
    queryKey: ["faculties"],
    queryFn: () => adminService.facultyService.getAllFaculties(),
  });
  const faculties = useMemo(() => facultiesQuery.data?.data || [], [facultiesQuery.data]);

  const filteredFaculties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return faculties;
    return faculties.filter((faculty: any) => {
      return (
        faculty.name?.toLowerCase().includes(query) ||
        faculty.code?.toLowerCase().includes(query) ||
        faculty.dean?.toLowerCase().includes(query)
      );
    });
  }, [faculties, searchQuery]);

  const stats = useMemo(() => {
    const totalDepartments = faculties.reduce(
      (count: number, faculty: any) => count + (faculty.departmentCount || 0),
      0,
    );
    const withDean = faculties.filter((faculty: any) => !!faculty.dean).length;
    const withoutDean = Math.max(0, faculties.length - withDean);

    return [
      {
        label: "Total Faculties",
        value: faculties.length,
        hint: "Active faculty records",
        trend: "neutral" as const,
      },
      {
        label: "Departments",
        value: totalDepartments,
        hint: "Departments across faculties",
        trend: "up" as const,
      },
      {
        label: "With Assigned Dean",
        value: withDean,
        hint: "Faculties with dean profile",
        trend: "up" as const,
      },
      {
        label: "Need Dean Assignment",
        value: withoutDean,
        hint: "Requires profile completion",
        trend: "neutral" as const,
      },
    ];
  }, [faculties]);

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.facultyService.createFaculty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setIsCreateDialogOpen(false);
      setFormData({ name: "", code: "", dean: "" });
      setFormError("");
      toast.success("Faculty created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create faculty";
      setFormError(message);
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.facultyService.deleteFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      toast.success("Faculty deleted successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete faculty";
      toast.error(message);
    },
  });

  const createFaculty = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    createMutation.mutate(formData);
  };

  const deleteFaculty = (id: string, name: string) => {
    if (window.confirm(`Delete ${name}? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const columns: AtlassianTableColumn<any>[] = [
    {
      id: "faculty",
      header: "Faculty",
      width: 380,
      sortable: true,
      sortAccessor: (faculty) => faculty.name?.toLowerCase() || "",
      render: (faculty) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-muted p-1.5">
            <School className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{faculty.name}</p>
          </div>
        </div>
      ),
    },
    {
      id: "deanStatus",
      header: "Dean Status",
      width: 180,
      align: "center",
      sortable: true,
      sortAccessor: (faculty) => (faculty.dean ? 1 : 0),
      render: (faculty) => (
        <Badge variant={faculty.dean ? "secondary" : "outline"}>
          {faculty.dean ? "Assigned" : "Unassigned"}
        </Badge>
      ),
    },
    {
      id: "departments",
      header: "Departments",
      width: 160,
      sortable: true,
      align: "center",
      sortAccessor: (faculty) => faculty.departmentCount || 0,
      render: (faculty) => (
        <Badge variant="secondary" className="inline-flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          {faculty.departmentCount || 0}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      width: 100,
      align: "right",
      render: (faculty) => (
        <div className="flex justify-end">
          <ActionMenu
            items={[
              {
                label: "View details",
                href: `/admin/faculties/${faculty.id}`,
                icon: <Edit className="h-3.5 w-3.5" />,
              },
              {
                label: "Delete faculty",
                onClick: () => deleteFaculty(faculty.id, faculty.name),
                icon: <Trash2 className="h-3.5 w-3.5" />,
                destructive: true,
                disabled: deleteMutation.isPending,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  if (facultiesQuery.isLoading) {
    return <LoadingPage label="Loading faculties..." />;
  }

  if (facultiesQuery.isError) {
    return (
      <ErrorLocalState
        title="Unable to load faculties"
        message="There was a problem loading faculty records. Please retry."
        onRetry={() => facultiesQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        title="Faculties"
        description="Manage faculties, dean assignment, and department structure."
        actions={
          <CreateFacultyDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={createFaculty}
            isCreating={createMutation.isPending}
            formError={formError}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setFormError("");
            }}
          />
        }
      />

      <DashboardMetricsGrid items={stats} />

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, code, or dean..."
            className="pl-9"
          />
        </div>
      </section>

      <AtlassianTable
        title="Faculty Directory"
        subtitle="Browse faculty records and manage details."
        data={filteredFaculties}
        columns={columns}
        rowKey={(faculty) => faculty.id}
        loading={facultiesQuery.isFetching}
        emptyTitle="No faculties found"
        emptyDescription="Create a new faculty or adjust your search."
        emptyIcon={<School className="h-10 w-10 text-muted-foreground/60" />}
      />
    </div>
  );
}
