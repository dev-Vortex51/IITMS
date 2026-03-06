import { EmptyState } from "@/components/design-system";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "../types";
import { formatStudentName, getStudentId } from "../utils/logbook-ui";

interface AssignedStudentsGridProps {
  students: Student[];
  searchQuery: string;
  onSelectStudent: (student: Student) => void;
}

export function AssignedStudentsGrid({
  students,
  searchQuery,
  onSelectStudent,
}: AssignedStudentsGridProps) {
  if (!students.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <EmptyState
            title="No students found"
            description={
              searchQuery
                ? "No students match your search query."
                : "No students have been assigned to you yet."
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {students.map((student) => (
        <Card
          key={getStudentId(student)}
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => onSelectStudent(student)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{formatStudentName(student)}</CardTitle>
            <CardDescription>{student.matricNumber}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Logbooks:</span>
                <span className="font-medium">{student.totalLogbooks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Review:</span>
                <span className="font-medium text-yellow-600">{student.pendingReview || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviewed:</span>
                <span className="font-medium text-green-600">{student.reviewed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
