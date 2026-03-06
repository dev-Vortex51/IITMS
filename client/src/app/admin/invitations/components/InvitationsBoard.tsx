import { formatDistanceToNow } from "date-fns";
import { Clock3, Mail, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, StatusBadge } from "@/components/design-system";
import { getRoleName } from "../utils/invitation-ui";
import type { Invitation } from "../types";

interface InvitationsBoardProps {
  invitations: Invitation[];
  isLoading: boolean;
  onResend: (id: string) => void;
  onCancel: (id: string) => void;
  isResending: boolean;
  isCancelling: boolean;
}

const boardColumns = [
  { key: "pending", title: "Pending", statuses: ["pending"] },
  { key: "accepted", title: "Accepted", statuses: ["accepted"] },
  { key: "closed", title: "Closed", statuses: ["expired", "cancelled"] },
] as const;

function LoadingCards() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-3 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function InvitationsBoard({
  invitations,
  isLoading,
  onResend,
  onCancel,
  isResending,
  isCancelling,
}: InvitationsBoardProps) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {boardColumns.map((column) => {
        const columnInvitations = invitations.filter((invitation) =>
          column.statuses.includes(invitation.status as (typeof column.statuses)[number]),
        );

        return (
          <article
            key={column.key}
            className="rounded-md border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
              <Badge variant="secondary">{columnInvitations.length}</Badge>
            </div>

            <div className="space-y-3 p-4">
              {isLoading ? (
                <LoadingCards />
              ) : columnInvitations.length === 0 ? (
                <EmptyState
                  title={`No ${column.title.toLowerCase()} invitations`}
                  description="Invitations matching this column will appear here."
                  icon={<Mail className="h-8 w-8 text-muted-foreground/60" />}
                />
              ) : (
                columnInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-md border border-border bg-background p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {invitation.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRoleName(invitation.role)}
                        </p>
                      </div>
                      <StatusBadge status={invitation.status} />
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        Sent{" "}
                        {formatDistanceToNow(new Date(invitation.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      {invitation.status === "pending" ? (
                        <p>
                          Expires{" "}
                          {formatDistanceToNow(new Date(invitation.expiresAt), {
                            addSuffix: true,
                          })}
                        </p>
                      ) : null}
                    </div>

                    {invitation.status === "pending" ? (
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-border"
                          onClick={() => onResend(invitation.id)}
                          disabled={isResending}
                        >
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => onCancel(invitation.id)}
                          disabled={isCancelling}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Cancel
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
