import { Ban, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function getRoleName(role: string) {
  const roleNames: Record<string, string> = {
    coordinator: "Coordinator",
    academic_supervisor: "Academic Supervisor",
    student: "Student",
    industrial_supervisor: "Industrial Supervisor",
  };

  return roleNames[role] || role;
}

export function getInvitationStatusBadge(status: string) {
  const config = {
    pending: { variant: "default" as const, icon: Clock },
    accepted: { variant: "default" as const, icon: CheckCircle2 },
    expired: { variant: "destructive" as const, icon: XCircle },
    cancelled: { variant: "secondary" as const, icon: Ban },
  }[status] || { variant: "secondary" as const, icon: Clock };

  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="flex w-fit items-center gap-1">
      <Icon className="h-4 w-4" />
      {status}
    </Badge>
  );
}
