"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { studentService, assessmentService } from "@/services/student.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentReportsPage() {
  const { user } = useAuth();

  const { data: students } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getAllStudents(),
    enabled: !!user,
  });

  const student = students?.data?.[0];

  const { data: placement } = useQuery({
    queryKey: ["placement", student?._id],
    queryFn: () => studentService.getStudentPlacement(student._id),
    enabled: !!student,
  });

  const { data: assessments } = useQuery({
    queryKey: ["assessments", placement?._id],
    queryFn: async () => {
      const response = await assessmentService.getAllAssessments({
        placement: placement?._id,
      });
      return response.data;
    },
    enabled: !!placement,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Reports</h1>
        <p className="text-muted-foreground mt-2">
          View your training reports and assessments
        </p>
      </div>

      {/* Training Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Training Summary</CardTitle>
          <CardDescription>
            Overview of your industrial training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Student Name</Label>
              <p className="font-medium">{student?.name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Matric Number</Label>
              <p className="font-medium">{student?.matricNumber || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Company</Label>
              <p className="font-medium">{placement?.companyName || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Training Period</Label>
              <p className="font-medium">
                {placement
                  ? `${new Date(
                      placement.startDate
                    ).toLocaleDateString()} - ${new Date(
                      placement.endDate
                    ).toLocaleDateString()}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Assessments</CardTitle>
          <CardDescription>Your supervisor assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {assessments && assessments.length > 0 ? (
            <div className="space-y-4">
              {assessments.map((assessment: any) => (
                <div key={assessment._id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">
                        {assessment.supervisorType === "departmental"
                          ? "Departmental"
                          : "Industrial"}{" "}
                        Supervisor Assessment
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {assessment.scores?.overall || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Overall Score
                      </p>
                    </div>
                  </div>

                  {assessment.scores && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      <div>
                        <Label className="text-muted-foreground text-xs">
                          Punctuality
                        </Label>
                        <p className="font-medium">
                          {assessment.scores.punctuality || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">
                          Initiative
                        </Label>
                        <p className="font-medium">
                          {assessment.scores.initiative || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">
                          Technical Skills
                        </Label>
                        <p className="font-medium">
                          {assessment.scores.technicalSkills || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">
                          Communication
                        </Label>
                        <p className="font-medium">
                          {assessment.scores.communication || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">
                          Teamwork
                        </Label>
                        <p className="font-medium">
                          {assessment.scores.teamwork || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}

                  {assessment.comments && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <Label className="text-muted-foreground text-xs">
                        Comments
                      </Label>
                      <p className="mt-1 text-sm">{assessment.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No assessments available yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Download your training reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled
            >
              <span>Download Training Report (PDF)</span>
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled
            >
              <span>Download Logbook Summary (PDF)</span>
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled
            >
              <span>Download Assessment Report (PDF)</span>
              <Download className="h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Export functionality coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
