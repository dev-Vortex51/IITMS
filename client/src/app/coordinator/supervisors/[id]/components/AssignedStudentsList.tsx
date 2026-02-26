import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import Link from "next/link";

export function AssignedStudentsList({ students }: { students: any[] }) {
  console.log(students);
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-lg">Assigned Students</CardTitle>
          <CardDescription>Mentees currently under guidance.</CardDescription>
        </div>
        <Badge variant="secondary" className="rounded-full px-3">
          {students.length} Total
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        {students.length > 0 ? (
          <div className="divide-y divide-border/50">
            {students.map((student: any) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {student.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {student.name || "Unknown Student"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.matricNumber || "No Matric Number"}
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-muted-foreground hover:text-primary"
                >
                  <Link href={`/coordinator/students/${student.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No students assigned
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This supervisor currently has no active mentees.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
