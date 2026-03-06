import { Award, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssessmentStatsProps {
  total: number;
  completed: number;
  drafts: number;
  averageScore: number;
}

export function AssessmentStats({
  total,
  completed,
  drafts,
  averageScore,
}: AssessmentStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">{total}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{completed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{drafts}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">{averageScore}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
