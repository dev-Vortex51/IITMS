import { Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Assessment } from "../types";
import { calculateAverageScore, getRecommendationBadge, getStatusBadge } from "../utils/assessment-ui";

interface AssessmentTableProps {
  title: string;
  description: string;
  assessments: Assessment[];
  isLoading?: boolean;
  emptyMessage: string;
  showRecommendation?: boolean;
  showStatus?: boolean;
  onView: (assessment: Assessment) => void;
}

export function AssessmentTable({
  title,
  description,
  assessments,
  isLoading,
  emptyMessage,
  showRecommendation = false,
  showStatus = false,
  onView,
}: AssessmentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading assessments...
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Grade</TableHead>
                {showRecommendation ? <TableHead>Recommendation</TableHead> : null}
                {showStatus ? <TableHead>Status</TableHead> : null}
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">
                    {assessment.student.user?.firstName} {assessment.student.user?.lastName}
                    <div className="text-sm text-muted-foreground">
                      {assessment.student.matricNumber}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{assessment.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      {calculateAverageScore(assessment.scores)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{assessment.grade || "N/A"}</Badge>
                  </TableCell>
                  {showRecommendation ? (
                    <TableCell>{getRecommendationBadge(assessment.recommendation)}</TableCell>
                  ) : null}
                  {showStatus ? (
                    <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                  ) : null}
                  <TableCell>
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onView(assessment)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
