import { Badge } from "@/components/ui/badge";

type StatusTone = "default" | "success" | "warning" | "destructive" | "secondary";

const statusMap: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "destructive" },
  submitted: { label: "Submitted", tone: "default" },
  scheduled: { label: "Scheduled", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  reviewed: { label: "Reviewed", tone: "default" },
  draft: { label: "Draft", tone: "secondary" },
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "secondary" },
  expired: { label: "Expired", tone: "destructive" },
  cancelled: { label: "Cancelled", tone: "secondary" },
  withdrawn: { label: "Withdrawn", tone: "secondary" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status?.toLowerCase() || "";
  const found = statusMap[key] || { label: status, tone: "secondary" as const };
  return <Badge variant={found.tone}>{found.label}</Badge>;
}
