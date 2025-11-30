"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { LoadingCard } from "@/components/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "sonner";

interface AssessmentScore {
  technical: number;
  communication: number;
  punctuality: number;
  initiative: number;
  teamwork: number;
  professionalism?: number;
  problemSolving?: number;
  adaptability?: number;
}

interface Assessment {
  _id: string;
  student: {
    _id: string;
    matricNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  supervisor: {
    _id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  type: "midterm" | "final";
  scores: AssessmentScore;
  strengths?: string;
  areasForImprovement?: string;
  comment?: string;
  recommendation: "excellent" | "very_good" | "good" | "fair" | "poor";
  grade?: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface Student {
  _id: string;
  matricNumber: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function DSupervisorAssessmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [assessmentType, setAssessmentType] = useState<"midterm" | "final">(
    "midterm"
  );
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form state for assessment creation
  const [scores, setScores] = useState<AssessmentScore>({
    technical: 0,
    communication: 0,
    punctuality: 0,
    initiative: 0,
    teamwork: 0,
    professionalism: 0,
    problemSolving: 0,
    adaptability: 0,
  });
  const [strengths, setStrengths] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");
  const [comment, setComment] = useState("");
  const [recommendation, setRecommendation] = useState<
    "excellent" | "very_good" | "good" | "fair" | "poor"
  >("good");

  const supervisorId = user?.profileData?._id;

  // Fetch supervisor dashboard to get assigned students
  const { data: dashboardData } = useQuery({
    queryKey: ["supervisor-dashboard", supervisorId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/supervisors/${supervisorId}/dashboard`
      );
      console.log("Dashboard response:", response.data.data);
      console.log(
        "Assigned students:",
        response.data.data?.supervisor?.assignedStudents
      );
      return response.data.data;
    },
    enabled: !!supervisorId,
  });

  // Fetch assessments
  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ["assessments", supervisorId],
    queryFn: async () => {
      const response = await apiClient.get("/assessments", {
        params: { supervisor: supervisorId },
      });
      return response.data.data;
    },
    enabled: !!supervisorId,
  });

  // Create assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      const response = await apiClient.post("/assessments", assessmentData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Assessment created successfully");
      queryClient.invalidateQueries({
        queryKey: ["assessments", supervisorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-dashboard", supervisorId],
      });
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create assessment"
      );
    },
  });

  const resetForm = () => {
    setSelectedStudent("");
    setAssessmentType("midterm");
    setScores({
      technical: 0,
      communication: 0,
      punctuality: 0,
      initiative: 0,
      teamwork: 0,
      professionalism: 0,
      problemSolving: 0,
      adaptability: 0,
    });
    setStrengths("");
    setAreasForImprovement("");
    setComment("");
    setRecommendation("good");
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate average score
    const scoreValues = Object.values(scores).filter((s) => s > 0);
    const avgScore =
      scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;

    // Determine grade
    let grade = "F";
    if (avgScore >= 70) grade = "A";
    else if (avgScore >= 60) grade = "B";
    else if (avgScore >= 50) grade = "C";
    else if (avgScore >= 45) grade = "D";
    else if (avgScore >= 40) grade = "E";

    const assessmentData = {
      student: selectedStudent,
      type: assessmentType,
      scores,
      strengths,
      areasForImprovement,
      comment,
      recommendation,
      grade,
    };

    createAssessmentMutation.mutate(assessmentData);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        variant: "secondary" as const,
        icon: Clock,
        label: "Pending",
        className: undefined,
      },
      submitted: {
        variant: "default" as const,
        icon: FileText,
        label: "Submitted",
        className: undefined,
      },
      approved: {
        variant: "default" as const,
        icon: CheckCircle2,
        label: "Approved",
        className: "bg-green-500 hover:bg-green-600",
      },
      rejected: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Rejected",
        className: undefined,
      },
    };
    const config =
      variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className || ""}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRecommendationBadge = (recommendation: string) => {
    const variants = {
      excellent: "bg-green-600 hover:bg-green-700",
      very_good: "bg-green-500 hover:bg-green-600",
      good: "bg-blue-500 hover:bg-blue-600",
      fair: "bg-yellow-500 hover:bg-yellow-600",
      poor: "bg-red-500 hover:bg-red-600",
    };
    return (
      <Badge
        className={
          variants[recommendation as keyof typeof variants] || variants.good
        }
      >
        {recommendation.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const calculateAverageScore = (scores: AssessmentScore) => {
    const scoreValues = Object.values(scores).filter((s) => s > 0);
    const avg =
      scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
    return avg.toFixed(1);
  };

  const assessments = assessmentsData || [];
  const students = dashboardData?.supervisor?.assignedStudents || [];

  const pendingAssessments = assessments.filter(
    (a: Assessment) => a.status === "pending"
  );
  const completedAssessments = assessments.filter(
    (a: Assessment) => a.status !== "pending"
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Student Assessments
          </h1>
          <p className="text-muted-foreground mt-2">
            Evaluate student performance and provide feedback
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Student Assessment</DialogTitle>
              <DialogDescription>
                Evaluate student performance across multiple criteria
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAssessment} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="student">Student *</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student: Student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.user?.firstName} {student.user?.lastName} (
                          {student.matricNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Assessment Type *</Label>
                  <Select
                    value={assessmentType}
                    onValueChange={(v) =>
                      setAssessmentType(v as "midterm" | "final")
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midterm">Midterm</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Performance Scores (0-100)
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { key: "technical", label: "Technical Skills" },
                    { key: "communication", label: "Communication" },
                    { key: "punctuality", label: "Punctuality" },
                    { key: "initiative", label: "Initiative" },
                    { key: "teamwork", label: "Teamwork" },
                    { key: "professionalism", label: "Professionalism" },
                    { key: "problemSolving", label: "Problem Solving" },
                    { key: "adaptability", label: "Adaptability" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>
                        {field.label}{" "}
                        {[
                          "technical",
                          "communication",
                          "punctuality",
                          "initiative",
                          "teamwork",
                        ].includes(field.key) && "*"}
                      </Label>
                      <Input
                        id={field.key}
                        type="number"
                        min="0"
                        max="100"
                        value={scores[field.key as keyof AssessmentScore]}
                        onChange={(e) =>
                          setScores({
                            ...scores,
                            [field.key]: parseInt(e.target.value) || 0,
                          })
                        }
                        required={[
                          "technical",
                          "communication",
                          "punctuality",
                          "initiative",
                          "teamwork",
                        ].includes(field.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="strengths">Strengths</Label>
                  <Textarea
                    id="strengths"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Describe the student's key strengths..."
                    rows={3}
                    maxLength={1000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="improvements">Areas for Improvement</Label>
                  <Textarea
                    id="improvements"
                    value={areasForImprovement}
                    onChange={(e) => setAreasForImprovement(e.target.value)}
                    placeholder="Identify areas where the student can improve..."
                    rows={3}
                    maxLength={1000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">General Comment</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Additional comments or observations..."
                    rows={3}
                    maxLength={1000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recommendation">
                    Overall Recommendation *
                  </Label>
                  <Select
                    value={recommendation}
                    onValueChange={(v) => setRecommendation(v as any)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="very_good">Very Good</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAssessmentMutation.isPending}
                >
                  {createAssessmentMutation.isPending
                    ? "Creating..."
                    : "Create Assessment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingAssessments.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedAssessments.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Students
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Assessments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Assessments</CardTitle>
              <CardDescription>
                View and manage all student assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading assessments...
                </div>
              ) : assessments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assessments found. Create your first assessment above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment: Assessment) => (
                      <TableRow key={assessment._id}>
                        <TableCell className="font-medium">
                          {assessment.student.user?.firstName}{" "}
                          {assessment.student.user?.lastName}
                          <div className="text-sm text-muted-foreground">
                            {assessment.student.matricNumber}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {assessment.type}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {calculateAverageScore(assessment.scores)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {assessment.grade || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getRecommendationBadge(assessment.recommendation)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(assessment.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setIsViewDialogOpen(true);
                            }}
                          >
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
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Assessments</CardTitle>
              <CardDescription>
                Assessments awaiting review or approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAssessments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending assessments
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAssessments.map((assessment: Assessment) => (
                      <TableRow key={assessment._id}>
                        <TableCell className="font-medium">
                          {assessment.student.user?.firstName}{" "}
                          {assessment.student.user?.lastName}
                          <div className="text-sm text-muted-foreground">
                            {assessment.student.matricNumber}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {assessment.type}
                        </TableCell>
                        <TableCell>
                          {calculateAverageScore(assessment.scores)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {assessment.grade || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setIsViewDialogOpen(true);
                            }}
                          >
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
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Assessments</CardTitle>
              <CardDescription>
                Submitted, approved, or rejected assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedAssessments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completed assessments
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedAssessments.map((assessment: Assessment) => (
                      <TableRow key={assessment._id}>
                        <TableCell className="font-medium">
                          {assessment.student.user?.firstName}{" "}
                          {assessment.student.user?.lastName}
                          <div className="text-sm text-muted-foreground">
                            {assessment.student.matricNumber}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {assessment.type}
                        </TableCell>
                        <TableCell>
                          {calculateAverageScore(assessment.scores)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {assessment.grade || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(assessment.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setIsViewDialogOpen(true);
                            }}
                          >
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
        </TabsContent>
      </Tabs>

      {/* View Assessment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
            <DialogDescription>
              {selectedAssessment && (
                <>
                  {selectedAssessment.student.user?.firstName}{" "}
                  {selectedAssessment.student.user?.lastName} -{" "}
                  <span className="capitalize">{selectedAssessment.type}</span>{" "}
                  Assessment
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Student</Label>
                  <p className="font-medium">
                    {selectedAssessment.student.user?.firstName}{" "}
                    {selectedAssessment.student.user?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAssessment.student.matricNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium capitalize">
                    {selectedAssessment.type}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedAssessment.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Recommendation
                  </Label>
                  <div className="mt-1">
                    {getRecommendationBadge(selectedAssessment.recommendation)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Average Score</Label>
                  <p className="font-medium text-xl">
                    {calculateAverageScore(selectedAssessment.scores)}%
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Grade</Label>
                  <p className="font-medium text-xl">
                    {selectedAssessment.grade || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Scores</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(selectedAssessment.scores)
                    .filter(([_, value]) => value > 0)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <span className="capitalize font-medium">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <Badge variant="outline">{value}%</Badge>
                      </div>
                    ))}
                </div>
              </div>

              {selectedAssessment.strengths && (
                <div className="space-y-2">
                  <Label>Strengths</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {selectedAssessment.strengths}
                  </p>
                </div>
              )}

              {selectedAssessment.areasForImprovement && (
                <div className="space-y-2">
                  <Label>Areas for Improvement</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {selectedAssessment.areasForImprovement}
                  </p>
                </div>
              )}

              {selectedAssessment.comment && (
                <div className="space-y-2">
                  <Label>General Comment</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {selectedAssessment.comment}
                  </p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Created:{" "}
                {new Date(selectedAssessment.createdAt).toLocaleString()}
                {selectedAssessment.updatedAt !==
                  selectedAssessment.createdAt && (
                  <>
                    {" "}
                    • Updated:{" "}
                    {new Date(selectedAssessment.updatedAt).toLocaleString()}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
