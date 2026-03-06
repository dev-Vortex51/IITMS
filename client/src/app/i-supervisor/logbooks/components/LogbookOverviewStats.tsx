import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogbookOverviewStatsProps {
  totalStudents: number;
  totalPendingReviews: number;
  totalLogbooks: number;
}

export function LogbookOverviewStats({
  totalStudents,
  totalPendingReviews,
  totalLogbooks,
}: LogbookOverviewStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{totalPendingReviews}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Logbooks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLogbooks}</div>
        </CardContent>
      </Card>
    </div>
  );
}
