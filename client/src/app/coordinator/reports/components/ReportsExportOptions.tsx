import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface ReportsExportOptionsProps {
  selectedDepartment?: string;
}

type ExportAction = {
  key: string;
  label: string;
  reportType: string;
  format: "pdf" | "excel";
  icon: "pdf" | "excel";
};

const actions: ExportAction[] = [
  {
    key: "students-list-pdf",
    label: "Student List (PDF)",
    reportType: "students-list",
    format: "pdf",
    icon: "pdf",
  },
  {
    key: "students-list-excel",
    label: "Student List (Excel)",
    reportType: "students-list",
    format: "excel",
    icon: "excel",
  },
  {
    key: "placements-summary-pdf",
    label: "Placement Report (PDF)",
    reportType: "placements-summary",
    format: "pdf",
    icon: "pdf",
  },
  {
    key: "placements-summary-excel",
    label: "Placement Report (Excel)",
    reportType: "placements-summary",
    format: "excel",
    icon: "excel",
  },
  {
    key: "supervisors-summary-pdf",
    label: "Supervisor List (PDF)",
    reportType: "supervisors-summary",
    format: "pdf",
    icon: "pdf",
  },
  {
    key: "assessments-summary-excel",
    label: "Analytics Summary (Excel)",
    reportType: "assessments-summary",
    format: "excel",
    icon: "excel",
  },
];

const buildDownloadName = (contentDisposition: string | null, fallback: string) => {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
};

export function ReportsExportOptions({ selectedDepartment = "all" }: ReportsExportOptionsProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleExport = async (action: ExportAction) => {
    try {
      setActiveKey(action.key);
      const params: Record<string, string> = { format: action.format };
      if (selectedDepartment !== "all") {
        params.departmentId = selectedDepartment;
      }

      const response = await apiClient.get(`/reports/exports/${action.reportType}`, {
        params,
        responseType: "blob",
      });
      const fallback = `${action.reportType}-${Date.now()}.${
        action.format === "pdf" ? "pdf" : "csv"
      }`;
      const fileName = buildDownloadName(
        response.headers["content-disposition"],
        fallback,
      );

      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ||
          (action.format === "pdf" ? "application/pdf" : "text/csv"),
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success(`${action.label} downloaded`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || `Failed to export ${action.label}`,
      );
    } finally {
      setActiveKey(null);
    }
  };

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2">
            <FileDown className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <CardTitle>Export Reports</CardTitle>
            <CardDescription>Download reports in various formats</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.key}
              variant="outline"
              className="justify-start"
              onClick={() => handleExport(action)}
              disabled={activeKey !== null}
            >
              {activeKey === action.key ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : action.icon === "excel" ? (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
