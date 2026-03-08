import { useState } from "react";
import { Download, FileBarChart, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface ExportOptionsProps {
  selectedFaculty?: string;
  selectedDepartment?: string;
}

type ExportAction = {
  key: string;
  label: string;
  reportType: string;
  format: "pdf" | "excel";
};

const systemReports: ExportAction[] = [
  {
    key: "institutional-overview",
    label: "Institutional Overview (PDF)",
    reportType: "institutional-overview",
    format: "pdf",
  },
  {
    key: "students-list-excel",
    label: "Student List (Excel)",
    reportType: "students-list",
    format: "excel",
  },
];

const placementReports: ExportAction[] = [
  {
    key: "placements-summary",
    label: "Placement Summary (PDF)",
    reportType: "placements-summary",
    format: "pdf",
  },
  {
    key: "supervisors-summary",
    label: "Supervisor Summary (PDF)",
    reportType: "supervisors-summary",
    format: "pdf",
  },
  {
    key: "assessments-summary",
    label: "Assessment Summary (Excel)",
    reportType: "assessments-summary",
    format: "excel",
  },
];

const buildDownloadName = (contentDisposition: string | null, fallback: string) => {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
};

export function ExportOptions({
  selectedFaculty = "all",
  selectedDepartment = "all",
}: ExportOptionsProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleExport = async (action: ExportAction) => {
    try {
      setActiveKey(action.key);
      const params: Record<string, string> = { format: action.format };
      if (selectedFaculty && selectedFaculty !== "all") {
        params.facultyId = selectedFaculty;
      }
      if (selectedDepartment && selectedDepartment !== "all") {
        params.departmentId = selectedDepartment;
      }

      const response = await apiClient.get(`/reports/exports/${action.reportType}`, {
        params,
        responseType: "blob",
      });

      const contentType =
        response.headers["content-type"] ||
        (action.format === "pdf" ? "application/pdf" : "text/csv");
      const fallback = `${action.reportType}-${Date.now()}.${
        action.format === "pdf" ? "pdf" : "csv"
      }`;
      const fileName = buildDownloadName(
        response.headers["content-disposition"],
        fallback,
      );

      const blob = new Blob([response.data], { type: contentType });
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
    <Card>
      <CardHeader>
        <CardTitle>Export Reports</CardTitle>
        <CardDescription>Download reports in various formats</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-medium">
              <FileBarChart className="h-4 w-4" />
              System Reports
            </h3>
            <div className="space-y-2">
              {systemReports.map((action) => (
                <Button
                  key={action.key}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleExport(action)}
                  disabled={activeKey !== null}
                >
                  <span>{action.label}</span>
                  {activeKey === action.key ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4" />
              Placement Reports
            </h3>
            <div className="space-y-2">
              {placementReports.map((action) => (
                <Button
                  key={action.key}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleExport(action)}
                  disabled={activeKey !== null}
                >
                  <span>{action.label}</span>
                  {activeKey === action.key ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
