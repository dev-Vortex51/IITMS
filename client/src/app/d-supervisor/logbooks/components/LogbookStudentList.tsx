import { ChevronRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/design-system";
import type { Student } from "../types";
import { formatStudentName, getStudentId } from "../utils/logbook-ui";

interface LogbookStudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export function LogbookStudentList({
  students,
  onSelectStudent,
}: LogbookStudentListProps) {
  if (!students.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <EmptyState
            title="No students found"
            description="Try a different search query."
            icon={<User className="h-12 w-12 text-muted-foreground/50" />}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <Card
          key={getStudentId(student)}
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => onSelectStudent(student)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{formatStudentName(student)}</h3>
                  <p className="text-sm text-muted-foreground">{student.matricNumber}</p>
                </div>
              </div>

              <div className="mr-4 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{student.totalLogbooks}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>

                {student.pendingReview > 0 ? (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{student.pendingReview}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                ) : null}

                {student.approved > 0 ? (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{student.approved}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                ) : null}

                {student.rejected > 0 ? (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{student.rejected}</p>
                    <p className="text-xs text-muted-foreground">Rejected</p>
                  </div>
                ) : null}
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
