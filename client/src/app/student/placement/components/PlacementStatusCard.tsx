"use client";

import { PlacementStatus } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  UserRound,
  XCircle,
} from "lucide-react";

interface PlacementStatusCardProps {
  placement: any;
  onEdit: () => void;
  onWithdraw: () => void;
  onStartNew: () => void;
  isUpdating: boolean;
  isWithdrawing: boolean;
  isCreating: boolean;
}

const statusConfig: Record<
  string,
  { icon: any; color: string; bg: string; badgeClass: string; text: string }
> = {
  approved: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    text: "Approved",
    badgeClass: "bg-emerald-100 text-emerald-800",
  },
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-100",
    text: "Pending Review",
    badgeClass: "bg-amber-100 text-amber-800",
  },
  rejected: {
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-100",
    text: "Rejected",
    badgeClass: "bg-rose-100 text-rose-800",
  },
  withdrawn: {
    icon: XCircle,
    color: "text-slate-600",
    bg: "bg-slate-200",
    text: "Withdrawn",
    badgeClass: "bg-slate-200 text-slate-700",
  },
};

export function PlacementStatusCard({
  placement,
  onEdit,
  onWithdraw,
  onStartNew,
  isUpdating,
  isWithdrawing,
  isCreating,
}: PlacementStatusCardProps) {
  const status = placement.status as PlacementStatus;
  const config = statusConfig[status] || {
    icon: Briefcase,
    color: "text-slate-600",
    bg: "bg-slate-200",
    text: status,
    badgeClass: "bg-slate-200 text-slate-700",
  };
  const StatusIcon = config.icon;

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-lg ${config.bg}`}>
              <StatusIcon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Placement Snapshot</CardTitle>
              <CardDescription>
                Submitted on {new Date(placement.createdAt || "").toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={`text-sm capitalize ${config.badgeClass}`}>
            {config.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              Student
            </p>
            <p className="mt-1 text-sm font-semibold">{placement.student?.name || "Your Record"}</p>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Company
            </p>
            <p className="mt-1 text-sm font-semibold">{placement.companyName || "N/A"}</p>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Duration
            </p>
            <p className="mt-1 text-sm font-semibold">
              {new Date(placement.startDate).toLocaleDateString()} -{" "}
              {new Date(placement.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {status === "pending" && (
            <>
              <Button variant="outline" className="h-9" onClick={onEdit} disabled={isUpdating}>
                Edit Details
              </Button>
              <Button variant="destructive" className="h-9" onClick={onWithdraw} disabled={isWithdrawing}>
                {isWithdrawing ? "Withdrawing..." : "Withdraw"}
              </Button>
            </>
          )}
          {status === "approved" && (
            <>
              <Button variant="outline" className="h-9" onClick={onEdit} disabled={isUpdating}>
                Change Placement
              </Button>
              <Button variant="destructive" className="h-9" onClick={onWithdraw} disabled={isWithdrawing}>
                {isWithdrawing ? "Withdrawing..." : "Withdraw"}
              </Button>
            </>
          )}
          {status === "rejected" && (
            <Button variant="outline" className="h-9" onClick={onStartNew} disabled={isCreating}>
              Submit New Placement
            </Button>
          )}
          {status === "withdrawn" && (
            <Button variant="outline" className="h-9" onClick={onStartNew} disabled={isCreating}>
              Submit New Placement
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
