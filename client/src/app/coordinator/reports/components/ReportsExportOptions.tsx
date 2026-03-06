import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ReportsExportOptions() {
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
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-200 text-slate-700">
            Coming Soon
          </Badge>
          <p className="text-xs text-muted-foreground">
            Export actions are staged for upcoming backend integration.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline" disabled className="justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Student List (PDF)
          </Button>
          <Button variant="outline" disabled className="justify-start">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Student List (Excel)
          </Button>
          <Button variant="outline" disabled className="justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Placement Report (PDF)
          </Button>
          <Button variant="outline" disabled className="justify-start">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Placement Report (Excel)
          </Button>
          <Button variant="outline" disabled className="justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Supervisor List (PDF)
          </Button>
          <Button variant="outline" disabled className="justify-start">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Analytics Summary (Excel)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
