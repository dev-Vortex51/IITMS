import { Group, Text } from "@mantine/core";
import { Badge } from "@/components/ui/badge";
import {
  ActionMenu,
  AtlassianTable,
  type AtlassianTableColumn,
} from "@/components/design-system";
import { Eye, GraduationCap } from "lucide-react";

interface PlacementListProps {
  placements: any[];
  isLoading: boolean;
}

const getStatusTone = (status: string) => {
  if (status === "approved") return "bg-emerald-100 text-emerald-800";
  if (status === "pending") return "bg-amber-100 text-amber-800";
  if (status === "rejected") return "bg-rose-100 text-rose-800";
  if (status === "withdrawn") return "bg-slate-200 text-slate-700";
  return "bg-slate-200 text-slate-700";
};

export function PlacementList({ placements, isLoading }: PlacementListProps) {
  const columns: AtlassianTableColumn<any>[] = [
    {
      id: "student",
      header: "Student",
      width: 320,
      sortable: true,
      sortAccessor: (placement) => (placement.student?.name || "").toLowerCase(),
      render: (placement) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-muted p-1.5">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <Text fw={600} size="sm">
              {placement.student?.name || "Unknown Student"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      id: "matric",
      header: "Matric No.",
      width: 170,
      sortable: true,
      sortAccessor: (placement) =>
        (placement.student?.matricNumber || "").toLowerCase(),
      render: (placement) => (
        <Text size="sm" ff="monospace">
          {placement.student?.matricNumber || "N/A"}
        </Text>
      ),
    },
    {
      id: "status",
      header: "Status",
      width: 140,
      sortable: true,
      sortAccessor: (placement) => placement.status || "",
      render: (placement) => (
        <Badge variant="secondary" className={`capitalize ${getStatusTone(placement.status)}`}>
          {placement.status || "pending"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      width: 90,
      align: "right",
      render: (placement) => (
        <Group justify="flex-end">
          <ActionMenu
            items={[
              {
                label: "Review details",
                href: `/coordinator/students/${placement.student?.id}/placement`,
                icon: <Eye className="h-3.5 w-3.5" />,
              },
            ]}
          />
        </Group>
      ),
    },
  ];

  return (
    <AtlassianTable
      title="Placement Queue"
      subtitle="Review student placement submissions and follow up on pending approvals."
      data={placements}
      columns={columns}
      rowKey={(placement) => placement.id}
      loading={isLoading}
      emptyTitle="No placements found"
      emptyDescription="Try adjusting your search or status filters."
    />
  );
}
