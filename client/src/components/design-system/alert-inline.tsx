import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "success" | "error" | "warning" | "info";

const toneClass: Record<AlertTone, string> = {
  success: "bg-green-50 text-green-700 border-green-200",
  error: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

const toneIcon: Record<AlertTone, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
  warning: <TriangleAlert className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

interface AlertInlineProps {
  tone?: AlertTone;
  message: string;
  className?: string;
}

export function AlertInline({ tone = "info", message, className }: AlertInlineProps) {
  return (
    <div className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-sm", toneClass[tone], className)}>
      {toneIcon[tone]}
      <span>{message}</span>
    </div>
  );
}
