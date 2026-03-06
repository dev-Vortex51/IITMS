import { Download, FileBarChart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const systemReports = [
  "Faculty Report (PDF)",
  "Department Report (PDF)",
  "Student Report (Excel)",
];

const placementReports = [
  "Placement Summary (PDF)",
  "Supervisor Report (PDF)",
  "Assessment Report (Excel)",
];

export function ExportOptions() {
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
              {systemReports.map((label) => (
                <Button key={label} variant="outline" className="w-full justify-between" disabled>
                  <span>{label}</span>
                  <Download className="h-4 w-4" />
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
              {placementReports.map((label) => (
                <Button key={label} variant="outline" className="w-full justify-between" disabled>
                  <span>{label}</span>
                  <Download className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">Export functionality coming soon</p>
      </CardContent>
    </Card>
  );
}
