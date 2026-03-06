import { Mail, RefreshCw, Trash2, UserCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  ActionMenu,
  AtlassianTable,
  type AtlassianTableColumn,
} from "@/components/design-system";
import { Group, Text } from "@mantine/core";
import { Badge } from "@/components/ui/badge";
import type { Invitation } from "../types";

interface InvitationsTableProps {
  invitations: Invitation[];
  isLoading: boolean;
  onResend: (id: string) => void;
  onCancel: (id: string) => void;
  isResending: boolean;
  isCancelling: boolean;
}

export function InvitationsTable({
  invitations,
  isLoading,
  onResend,
  onCancel,
  isResending,
  isCancelling,
}: InvitationsTableProps) {
  const getStatusTone = (status: string) => {
    if (status === "accepted") return "bg-emerald-100 text-emerald-800";
    if (status === "pending") return "bg-amber-100 text-amber-800";
    if (status === "expired") return "bg-rose-100 text-rose-800";
    return "bg-slate-200 text-slate-700";
  };

  const columns: AtlassianTableColumn<Invitation>[] = [
    {
      id: "recipient",
      header: "Recipient",
      width: 360,
      sortable: true,
      sortAccessor: (invitation) => invitation.email.toLowerCase(),
      render: (invitation) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-muted p-1.5">
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <Text fw={600} size="sm" className="text-foreground">
              {invitation.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      width: 140,
      sortable: true,
      sortAccessor: (invitation) => invitation.status,
      render: (invitation) => (
        <Badge
          variant="secondary"
          className={`capitalize ${getStatusTone(invitation.status)}`}
        >
          {invitation.status}
        </Badge>
      ),
    },
    {
      id: "sent",
      header: "Sent",
      width: 180,
      sortable: true,
      sortAccessor: (invitation) => new Date(invitation.createdAt).getTime(),
      render: (invitation) => (
        <Text size="sm" c="dimmed">
          {formatDistanceToNow(new Date(invitation.createdAt), {
            addSuffix: true,
          })}
        </Text>
      ),
    },
    {
      id: "expires",
      header: "Expires",
      width: 180,
      sortable: true,
      sortAccessor: (invitation) => new Date(invitation.expiresAt).getTime(),
      render: (invitation) => (
        <Text size="sm" c="dimmed">
          {invitation.status === "pending"
            ? formatDistanceToNow(new Date(invitation.expiresAt), {
                addSuffix: true,
              })
            : "-"}
        </Text>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      width: 100,
      render: (invitation) => (
        <Group justify="flex-end" gap={8}>
          <ActionMenu
            items={
              invitation.status === "pending"
                ? [
                    {
                      label: "Resend invitation",
                      onClick: () => onResend(invitation.id),
                      icon: <RefreshCw className="h-3.5 w-3.5" />,
                      disabled: isResending,
                    },
                    {
                      label: "Cancel invitation",
                      onClick: () => onCancel(invitation.id),
                      icon: <Trash2 className="h-3.5 w-3.5" />,
                      destructive: true,
                      disabled: isCancelling,
                    },
                  ]
                : [
                    {
                      label: "No actions available",
                      disabled: true,
                    },
                  ]
            }
          />
        </Group>
      ),
    },
  ];

  return (
    <AtlassianTable
      title="Invitation Activity"
      subtitle="Track pending, accepted, expired, and cancelled invitations."
      data={invitations}
      columns={columns}
      rowKey={(invitation) => invitation.id}
      loading={isLoading}
      emptyTitle="No invitations found"
      emptyDescription="Try adjusting your search or filters."
      emptyIcon={<Mail className="h-10 w-10 text-muted-foreground/50" />}
    />
  );
}
