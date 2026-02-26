import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StudentActivitySummary() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
        </CardContent>
      </Card>
    </div>
  );
}
