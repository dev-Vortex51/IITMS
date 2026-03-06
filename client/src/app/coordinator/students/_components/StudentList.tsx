import Link from "next/link";
import { Group, Text } from "@mantine/core";
import {
  ActionMenu,
  AtlassianTable,
  type AtlassianTableColumn,
} from "@/components/design-system";
import {
  CheckCircle2,
  Eye,
  Flag,
  GraduationCap,
  Users,
  XCircle,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { placementService } from "@/services/student.service";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface StudentListProps {
  students: any[];
  isLoading: boolean;
  searchQuery: string;
}

const getPlacementStatus = (student: any) => {
  if (!student.placement) return { text: "No Placement", color: "gray" };

  const status = student.placement.status || "pending";
  const statusMap: Record<string, { text: string; color: string }> = {
    approved: { text: "Approved", color: "green" },
    pending: { text: "Pending", color: "yellow" },
    rejected: { text: "Rejected", color: "red" },
  };

  return statusMap[status] || { text: "Unknown", color: "gray" };
};

const getStatusTone = (statusText: string) => {
  if (statusText === "Approved") return "bg-emerald-100 text-emerald-800";
  if (statusText === "Pending") return "bg-amber-100 text-amber-800";
  if (statusText === "Rejected") return "bg-rose-100 text-rose-800";
  if (statusText === "No Placement") return "bg-slate-200 text-slate-700";
  return "bg-slate-200 text-slate-700";
};

export function StudentList({ students, isLoading, searchQuery }: StudentListProps) {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: ({ placementId }: { placementId: string }) =>
      placementService.approvePlacement(placementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Placement approved");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve placement");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ placementId, remarks }: { placementId: string; remarks: string }) =>
      placementService.rejectPlacement(placementId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Placement rejected");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject placement");
    },
  });

  const columns: AtlassianTableColumn<any>[] = [
    {
      id: "student",
      header: "Student",
      sortable: true,
      sortAccessor: (student) => (student.name || "").toLowerCase(),
      render: (student) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-muted p-1.5">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <Text fw={600} size="sm">
              {student.name || "N/A"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      id: "matric",
      header: "Matric No.",
      width: 160,
      sortable: true,
      sortAccessor: (student) => (student.matricNumber || "").toLowerCase(),
      render: (student) => (
          <Text ff="monospace" size="xs">
            {student.matricNumber || "N/A"}
          </Text>
      ),
    },
    {
      id: "department",
      header: "Department",
      sortable: true,
      sortAccessor: (student) =>
        (
          typeof student.department === "object"
            ? student.department.name
            : student.department || ""
        ).toLowerCase(),
      render: (student) => {
        const departmentName =
          typeof student.department === "object"
            ? student.department.name
            : student.department || "-";

        return <Text size="sm">{departmentName}</Text>;
      },
    },
    {
      id: "placement",
      header: "Placement",
      sortable: true,
      sortAccessor: (student) =>
        (
          student.placement && typeof student.placement === "object"
            ? student.placement.companyName || ""
            : ""
        ).toLowerCase(),
      render: (student) => {
        const placementName =
          student.placement && typeof student.placement === "object"
            ? student.placement.companyName || "Placement"
            : "-";

        return <Text size="sm">{placementName}</Text>;
      },
    },
    {
      id: "status",
      header: "Status",
      width: 140,
      sortable: true,
      sortAccessor: (student) => getPlacementStatus(student).text,
      render: (student) => {
        const status = getPlacementStatus(student);

        return (
          <Badge variant="secondary" className={getStatusTone(status.text)}>
            {status.text}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      width: 90,
      render: (student) => {
        const status = getPlacementStatus(student);
        const placementId = student.placement?.id;
        const canReviewPlacement =
          Boolean(placementId) && status.text !== "Approved" && status.text !== "Rejected";

        return (
          <Group justify="flex-end">
            <ActionMenu
              items={[
                {
                  label: "View student",
                  href: `/coordinator/students/${student.id}`,
                  icon: <Eye className="h-3.5 w-3.5" />,
                },
                {
                  label: "Accept placement",
                  icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                  disabled: !canReviewPlacement || approveMutation.isPending,
                  onClick: () => {
                    if (!placementId) {
                      toast.error("No placement to approve");
                      return;
                    }
                    approveMutation.mutate({ placementId });
                  },
                },
                {
                  label: "Reject placement",
                  icon: <XCircle className="h-3.5 w-3.5" />,
                  destructive: true,
                  disabled: !canReviewPlacement || rejectMutation.isPending,
                  onClick: () => {
                    if (!placementId) {
                      toast.error("No placement to reject");
                      return;
                    }
                    const remarks = window.prompt("Reason for rejection:", "Rejected by coordinator");
                    if (!remarks) return;
                    rejectMutation.mutate({ placementId, remarks });
                  },
                },
                {
                  label: "Flag for follow-up",
                  icon: <Flag className="h-3.5 w-3.5" />,
                  onClick: () => toast.info("Flagged for follow-up"),
                },
              ]}
            />
          </Group>
        );
      },
    },
  ];

  return (
    <AtlassianTable
      title="Students List"
      subtitle="Track student records, placement progress, and review actions."
      data={students}
      columns={columns}
      rowKey={(student) => student.id}
      loading={isLoading}
      emptyTitle={searchQuery ? "No Students Found" : "No Students Yet"}
      emptyDescription={
        searchQuery
          ? "Try adjusting your search criteria."
          : "Students registered to your department will appear here."
      }
      emptyIcon={<Users className="h-10 w-10 text-muted-foreground/50" />}
    />
  );
}
