"use client";

import { useState } from "react";
import { useInvitations } from "./hooks/useInvitations";
import { InvitationMetrics } from "./components/InvitationMetrics";
import { CreateInvitationDialog } from "./components/CreateInvitationDialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Mail, Plus, Search, RefreshCw, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CoordinatorInvitationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    invitations,
    stats,
    isLoading,
    createInvitation,
    isCreating,
    resendInvitation,
    isResending,
    cancelInvitation,
    isCancelling,
  } = useInvitations(statusFilter);

  const filteredInvitations = invitations.filter(
    (inv: any) =>
      inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage onboarding for students and supervisors.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Send Invitation
        </Button>
      </div>

      <InvitationMetrics stats={stats} />

      {/* Main Table Card with Integrated Toolbar */}
      <Card className="shadow-sm border-border/50">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow>
              <TableHead className="w-[300px]">Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredInvitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <Mail className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No invitations found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvitations.map((inv: any) => (
                <TableRow
                  key={inv.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <p className="font-medium text-sm">{inv.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {inv.role.replace("_", " ")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(inv.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.status === "pending"
                      ? formatDistanceToNow(new Date(inv.expiresAt), {
                          addSuffix: true,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {inv.status === "pending" && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => resendInvitation(inv.id)}
                          disabled={isResending}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => cancelInvitation(inv.id)}
                          disabled={isCancelling}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateInvitationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={createInvitation}
        isPending={isCreating}
      />
    </div>
  );
}

// Helper for soft, modern status badges
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100/80 text-amber-800 border-amber-200",
    accepted: "bg-emerald-100/80 text-emerald-800 border-emerald-200",
    expired: "bg-rose-100/80 text-rose-800 border-rose-200",
    cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status] || styles.cancelled}`}
    >
      {status}
    </span>
  );
}
