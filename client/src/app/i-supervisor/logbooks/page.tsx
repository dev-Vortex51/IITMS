"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  _id: string;
  matricNumber: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  logbooks?: Logbook[];
  totalLogbooks?: number;
  pendingReview?: number;
  reviewed?: number;
}

interface Logbook {
  _id: string;
  student: Student;
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasksPerformed: string;
  skillsAcquired?: string;
  challenges?: string;
  lessonsLearned?: string;
  evidence?: {
    name: string;
    path: string;
  }[];
  industrialReview?: {
    status: string;
    comment?: string;
    rating?: number;
    reviewedAt?: string;
  };
  departmentalReview?: {
    status: string;
    comment?: string;
    rating?: number;
    reviewedAt?: string;
  };
  status: string;
  submittedAt?: string;
  createdAt: string;
}

export default function ISupervisorLogbooksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const supervisorId = user?.profileData?._id;

  // Fetch assigned students with their logbook stats
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["supervisor-students", supervisorId],
    queryFn: async () => {
      const dashboardResponse = await apiClient.get(
        `/supervisors/${supervisorId}/dashboard`
      );
      const assignedStudents =
        dashboardResponse.data.data?.supervisor?.assignedStudents || [];

      // Fetch logbooks for each student
      const studentsWithLogbooks = await Promise.all(
        assignedStudents.map(async (student: any) => {
          try {
            const logbooksResponse = await apiClient.get(
              `/logbooks?student=${student._id}`
            );
            const logbooks = logbooksResponse.data.data || [];

            return {
              ...student,
              logbooks,
              totalLogbooks: logbooks.length,
              pendingReview: logbooks.filter(
                (l: any) => l.industrialReview?.status === "submitted"
              ).length,
              reviewed: logbooks.filter(
                (l: any) =>
                  l.industrialReview?.status === "approved" ||
                  l.industrialReview?.status === "rejected"
              ).length,
            };
          } catch (error) {
            return {
              ...student,
              logbooks: [],
              totalLogbooks: 0,
              pendingReview: 0,
              reviewed: 0,
            };
          }
        })
      );

      return studentsWithLogbooks;
    },
    enabled: !!supervisorId,
  });

  // Review logbook mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: {
      logbookId: string;
      comment: string;
      rating: number;
    }) => {
      const response = await apiClient.post(
        `/logbooks/${data.logbookId}/industrial-review`,
        {
          comment: data.comment,
          rating: data.rating,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully");
      queryClient.invalidateQueries({
        queryKey: ["supervisor-students", supervisorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-dashboard", supervisorId],
      });
      setReviewDialogOpen(false);
      setReviewComment("");
      setReviewRating("");
      setSelectedLogbook(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const handleReview = () => {
    if (!selectedLogbook) return;
    if (!reviewComment.trim()) {
      toast.error("Please provide a comment");
      return;
    }
    if (!reviewRating) {
      toast.error("Please provide a rating");
      return;
    }

    reviewMutation.mutate({
      logbookId: selectedLogbook._id,
      comment: reviewComment,
      rating: parseInt(reviewRating),
    });
  };

  const students = studentsData || [];

  // Filter students based on search
  const filteredStudents = students.filter((student: any) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName =
      `${student.user?.firstName} ${student.user?.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      student.matricNumber?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      submitted: {
        variant: "secondary" as const,
        icon: Clock,
        label: "Pending Review",
        className: undefined,
      },
      approved: {
        variant: "default" as const,
        icon: CheckCircle2,
        label: "Reviewed",
        className: "bg-green-500 hover:bg-green-600",
      },
      rejected: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Reviewed",
        className: undefined,
      },
    };
    const config =
      variants[status as keyof typeof variants] || variants.submitted;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className || ""}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          Loading students and logbooks...
        </div>
      </div>
    );
  }

  // Student list view
  if (!selectedStudent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Student Logbooks</h1>
          <p className="text-muted-foreground mt-2">
            Review logbook entries from your assigned students
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search students by name or matric number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {students.reduce(
                  (sum: number, s: any) => sum + s.pendingReview,
                  0
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Logbooks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.reduce(
                  (sum: number, s: any) => sum + s.totalLogbooks,
                  0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchQuery
                ? "No students found matching your search"
                : "No students assigned"}
            </div>
          ) : (
            filteredStudents.map((student: any) => (
              <Card
                key={student._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedStudent(student)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {student.user?.firstName} {student.user?.lastName}
                  </CardTitle>
                  <CardDescription>{student.matricNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Logbooks:
                      </span>
                      <span className="font-medium">
                        {student.totalLogbooks}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Pending Review:
                      </span>
                      <span className="font-medium text-yellow-600">
                        {student.pendingReview}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reviewed:</span>
                      <span className="font-medium text-green-600">
                        {student.reviewed}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  // Student's logbooks view
  const studentLogbooks = selectedStudent.logbooks || [];
  const filteredLogbooks =
    statusFilter === "all"
      ? studentLogbooks
      : studentLogbooks.filter((l: Logbook) => {
          if (statusFilter === "pending")
            return l.industrialReview?.status === "submitted";
          if (statusFilter === "reviewed")
            return (
              l.industrialReview?.status === "approved" ||
              l.industrialReview?.status === "rejected"
            );
          return true;
        });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedStudent(null)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {selectedStudent.user?.firstName} {selectedStudent.user?.lastName}
            &apos;s Logbooks
          </h1>
          <p className="text-muted-foreground">
            {selectedStudent.matricNumber}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Logbooks</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logbooks List */}
      <div className="space-y-4">
        {filteredLogbooks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No logbooks found
            </CardContent>
          </Card>
        ) : (
          filteredLogbooks.map((logbook: Logbook) => (
            <Card key={logbook._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Week {logbook.weekNumber}
                    </CardTitle>
                    <CardDescription>
                      {new Date(logbook.startDate).toLocaleDateString()} -{" "}
                      {new Date(logbook.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {logbook.industrialReview?.status &&
                      getStatusBadge(logbook.industrialReview.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLogbook(logbook);
                        setReviewDialogOpen(true);
                        setReviewComment(
                          logbook.industrialReview?.comment || ""
                        );
                        setReviewRating(
                          logbook.industrialReview?.rating?.toString() || ""
                        );
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {logbook.industrialReview?.status === "submitted"
                        ? "Review"
                        : "View"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">
                      Tasks Performed
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {logbook.tasksPerformed}
                    </p>
                  </div>
                  {logbook.industrialReview?.comment && (
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-medium">
                          Your Review
                        </Label>
                      </div>
                      <p className="text-sm">
                        {logbook.industrialReview.comment}
                      </p>
                      {logbook.industrialReview.rating && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Rating:</span>{" "}
                          {logbook.industrialReview.rating}/10
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      {reviewDialogOpen && (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setReviewDialogOpen(false);
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Logbook Week {selectedLogbook?.weekNumber}
              </DialogTitle>
              <DialogDescription>
                Review student&apos;s logbook entry
              </DialogDescription>
            </DialogHeader>
            {selectedLogbook && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Period</Label>
                  <p className="text-sm">
                    {new Date(selectedLogbook.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedLogbook.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tasks Performed</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg mt-1">
                    {selectedLogbook.tasksPerformed}
                  </p>
                </div>

                {selectedLogbook.skillsAcquired && (
                  <div>
                    <Label className="text-sm font-medium">
                      Skills Acquired
                    </Label>
                    <p className="text-sm bg-muted p-3 rounded-lg mt-1">
                      {selectedLogbook.skillsAcquired}
                    </p>
                  </div>
                )}

                {selectedLogbook.challenges && (
                  <div>
                    <Label className="text-sm font-medium">Challenges</Label>
                    <p className="text-sm bg-muted p-3 rounded-lg mt-1">
                      {selectedLogbook.challenges}
                    </p>
                  </div>
                )}

                {selectedLogbook.lessonsLearned && (
                  <div>
                    <Label className="text-sm font-medium">
                      Lessons Learned
                    </Label>
                    <p className="text-sm bg-muted p-3 rounded-lg mt-1">
                      {selectedLogbook.lessonsLearned}
                    </p>
                  </div>
                )}

                {selectedLogbook.evidence &&
                  selectedLogbook.evidence.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">
                        Evidence Files
                      </Label>
                      <div className="space-y-2 mt-1">
                        {selectedLogbook.evidence.map((file, index) => (
                          <a
                            key={index}
                            href={`${process.env.NEXT_PUBLIC_API_URL}${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            {file.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedLogbook.industrialReview?.status !== "submitted" && (
                  <div className="bg-muted p-4 rounded-lg">
                    <Label className="text-sm font-medium">
                      Your Previous Review
                    </Label>
                    <p className="text-sm mt-2">
                      {selectedLogbook.industrialReview?.comment}
                    </p>
                    {selectedLogbook.industrialReview?.rating && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Rating:</span>{" "}
                        {selectedLogbook.industrialReview.rating}/10
                      </p>
                    )}
                  </div>
                )}

                {selectedLogbook.industrialReview?.status === "submitted" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating (0-10) *</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="10"
                        value={reviewRating}
                        onChange={(e) => setReviewRating(e.target.value)}
                        placeholder="Enter rating"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comment">Comment *</Label>
                      <Textarea
                        id="comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Provide your feedback..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setReviewDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReview}
                        disabled={reviewMutation.isPending}
                      >
                        {reviewMutation.isPending
                          ? "Submitting..."
                          : "Submit Review"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
