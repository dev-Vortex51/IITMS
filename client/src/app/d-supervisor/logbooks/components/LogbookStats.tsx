import { BookOpen, CheckCircle, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "../types";

interface LogbookStatsProps {
  selectedStudent: Student | null;
  studentsCount: number;
  totalPendingReviews: number;
  totalReviewed: number;
}

export function LogbookStats({
  selectedStudent,
  studentsCount,
  totalPendingReviews,
  totalReviewed,
}: LogbookStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {selectedStudent ? "Total Logbooks" : "Assigned Students"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {selectedStudent ? (
              <BookOpen className="h-5 w-5 text-primary" />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
            <span className="text-2xl font-bold text-primary">
              {selectedStudent ? selectedStudent.totalLogbooks : studentsCount}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">
              {selectedStudent
                ? selectedStudent.pendingReview
                : totalPendingReviews}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {selectedStudent ? "Approved" : "Total Reviewed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {selectedStudent ? selectedStudent.approved : totalReviewed}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
