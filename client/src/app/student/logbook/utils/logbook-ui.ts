import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";

export const logbookStatusConfig = {
  draft: {
    label: "Draft",
    variant: "secondary",
    icon: FileText,
  },
  submitted: {
    label: "Submitted",
    variant: "default",
    icon: Clock,
  },
  reviewed: {
    label: "Reviewed",
    variant: "default",
    icon: CheckCircle,
  },
  approved: {
    label: "Approved",
    variant: "success",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
  },
} as const;

export const getLogbookStatusInfo = (status: string) => {
  return (
    logbookStatusConfig[status as keyof typeof logbookStatusConfig] || {
      label: status,
      variant: "secondary",
      icon: FileText,
    }
  );
};
