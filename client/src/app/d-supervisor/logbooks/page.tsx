"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ChevronRight,
  ArrowLeft,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  matricNumber: string;
  logbooks: any[];
  totalLogbooks: number;
  pendingReview: number;
  approved: number;
  rejected: number;
}

export default function DSupervisorLogbooksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLogbook, setSelectedLogbook] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">(
    "approved"
  );

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
                (l: any) => l.departmentalReview?.status === "submitted"
              ).length,
              approved: logbooks.filter(
                (l: any) => l.departmentalReview?.status === "approved"
              ).length,
              rejected: logbooks.filter(
                (l: any) => l.departmentalReview?.status === "rejected"
              ).length,
            };
          } catch (error) {
            return {
              ...student,
              logbooks: [],
              totalLogbooks: 0,
              pendingReview: 0,
              approved: 0,
              rejected: 0,
            };
          }
        })
      );

      return studentsWithLogbooks;
    },
    enabled: !!supervisorId,
  });

  const students = studentsData || [];

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: {
      logbookId: string;
      comment: string;
      rating: number;
      status: string;
    }) => {
      const response = await apiClient.post(
        `/logbooks/${data.logbookId}/review`,
        {
          comment: data.comment,
          rating: data.rating,
          status: data.status,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-students"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor-dashboard"] });
      toast.success("Logbook review submitted successfully");
      setReviewDialogOpen(false);
      setSelectedLogbook(null);
      setReviewComment("");
      setReviewRating("");
      setReviewStatus("approved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  // Filter students
  const filteredStudents = students.filter((student: Student) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      student.user?.firstName?.toLowerCase().includes(search) ||
      student.user?.lastName?.toLowerCase().includes(search) ||
      student.matricNumber?.toLowerCase().includes(search)
    );
  });

  // Filter logbooks for selected student
  const getFilteredLogbooks = (student: Student) => {
    if (!student?.logbooks) return [];

    return student.logbooks.filter((logbook: any) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "draft") return logbook.status === "draft";
      if (statusFilter === "pending")
        return (
          logbook.status === "submitted" &&
          logbook.departmentalReview?.status === "submitted"
        );
      if (statusFilter === "reviewed")
        return logbook.departmentalReview?.status === "reviewed";
      if (statusFilter === "approved")
        return logbook.departmentalReview?.status === "approved";
      if (statusFilter === "rejected")
        return logbook.departmentalReview?.status === "rejected";
      return true;
    });
  };

  const handleReview = (logbook: any) => {
    setSelectedLogbook(logbook);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    const rating = Number(reviewRating);
    if (isNaN(rating) || rating < 0 || rating > 10) {
      toast.error("Rating must be between 0 and 10");
      return;
    }

    reviewMutation.mutate({
      logbookId: selectedLogbook._id,
      comment: reviewComment,
      rating,
      status: reviewStatus,
    });
  };

  const getStatusBadge = (logbook: any) => {
    const status = logbook.departmentalReview?.status || logbook.status;
    const config: Record<string, { variant: any; text: string }> = {
      submitted: { variant: "outline", text: "Pending Review" },
      reviewed: { variant: "secondary", text: "Reviewed" },
      approved: { variant: "default", text: "Approved" },
      rejected: { variant: "destructive", text: "Rejected" },
      draft: { variant: "secondary", text: "Draft" },
    };
    return config[status] || { variant: "secondary", text: "Unknown" };
  };

  // Calculate totals
  const totalPendingReviews = students.reduce(
    (sum, s) => sum + (s.pendingReview || 0),
    0
  );
  const totalReviewed = students.reduce(
    (sum, s) => sum + (s.approved || 0) + (s.rejected || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {selectedStudent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStudent(null);
              setStatusFilter("all");
              setSearchQuery("");
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary">
            {selectedStudent
              ? `${
                  typeof selectedStudent.user === "object"
                    ? selectedStudent.user?.firstName
                    : "Student"
                } ${
                  typeof selectedStudent.user === "object"
                    ? selectedStudent.user?.lastName || ""
                    : ""
                }'s Logbooks`
              : "Logbook Reviews"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {selectedStudent
              ? `Review logbook entries for ${selectedStudent.matricNumber}`
              : "Manage student logbook submissions"}
          </p>
        </div>
      </div>

      {/* Statistics */}
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
                {selectedStudent
                  ? selectedStudent.totalLogbooks
                  : students.length}
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

      {/* Search/Filter */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedStudent ? "Filter Logbooks" : "Search Students"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={
                    selectedStudent
                      ? "Search logbooks..."
                      : "Search by student name or matric number..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {selectedStudent && (
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {!selectedStudent ? (
        // Students List
        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <Card
                key={student._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {student.user?.firstName ||
                            student.firstName ||
                            "Student"}{" "}
                          {student.user?.lastName || student.lastName || ""}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {student.matricNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mr-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {student.totalLogbooks}
                        </p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      {student.pendingReview > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">
                            {student.pendingReview}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pending
                          </p>
                        </div>
                      )}
                      {student.approved > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {student.approved}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Approved
                          </p>
                        </div>
                      )}
                      {student.rejected > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">
                            {student.rejected}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Rejected
                          </p>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Logbooks List for Selected Student
        <div className="space-y-4">
          {getFilteredLogbooks(selectedStudent).length > 0 ? (
            getFilteredLogbooks(selectedStudent).map((logbook: any) => {
              const statusConfig = getStatusBadge(logbook);
              const isReviewable =
                logbook.departmentalReview?.status === "submitted";

              return (
                <Card key={logbook._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            Week {logbook.weekNumber}
                          </h3>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.text}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground mb-4">
                          <p>
                            <span className="font-medium text-foreground">
                              Period:
                            </span>{" "}
                            {new Date(logbook.startDate).toLocaleDateString()} -{" "}
                            {new Date(logbook.endDate).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">
                              Submitted:
                            </span>{" "}
                            {logbook.submittedAt
                              ? new Date(
                                  logbook.submittedAt
                                ).toLocaleDateString()
                              : "Not submitted"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Tasks Performed
                            </Label>
                            <p className="text-sm line-clamp-2">
                              {logbook.tasksPerformed || "N/A"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Skills Acquired
                            </Label>
                            <p className="text-sm line-clamp-2">
                              {logbook.skillsAcquired || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button
                          onClick={() => handleReview(logbook)}
                          disabled={reviewMutation.isPending}
                          size="sm"
                          variant={isReviewable ? "default" : "outline"}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {isReviewable ? "Review" : "View"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No logbooks found</p>
                {statusFilter !== "all" && (
                  <p className="text-sm mt-2">Try adjusting your filters</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Logbook - Week {selectedLogbook?.weekNumber}
            </DialogTitle>
            <DialogDescription>
              {typeof selectedStudent?.user === "object" && selectedStudent.user
                ? `${selectedStudent.user.firstName || "Student"} ${
                    selectedStudent.user.lastName || ""
                  }`
                : "Student"}{" "}
              ({selectedStudent?.matricNumber})
            </DialogDescription>
          </DialogHeader>

          {selectedLogbook && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Period</Label>
                <p className="text-sm mt-1">
                  {new Date(selectedLogbook.startDate).toLocaleDateString()} -{" "}
                  {new Date(selectedLogbook.endDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Tasks Performed</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {selectedLogbook.tasksPerformed || "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Skills Acquired</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {selectedLogbook.skillsAcquired || "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Challenges Faced</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {selectedLogbook.challenges || "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Lessons Learned</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {selectedLogbook.lessonsLearned || "N/A"}
                </p>
              </div>

              {selectedLogbook.evidence &&
                selectedLogbook.evidence.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Evidence</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {selectedLogbook.evidence.map(
                        (file: any, index: number) => (
                          <a
                            key={index}
                            href={`${process.env.NEXT_PUBLIC_API_URL}/${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 border rounded hover:bg-muted transition-colors text-sm"
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedLogbook.departmentalReview?.status !== "submitted" && (
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Previous Review</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      {selectedLogbook.departmentalReview?.status}
                    </p>
                    {selectedLogbook.reviews?.find(
                      (r: any) => r.supervisorType === "departmental"
                    ) && (
                      <>
                        <p className="text-sm">
                          <span className="font-medium">Rating:</span>{" "}
                          {
                            selectedLogbook.reviews.find(
                              (r: any) => r.supervisorType === "departmental"
                            ).rating
                          }
                          /10
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Comment:</span>{" "}
                          {
                            selectedLogbook.reviews.find(
                              (r: any) => r.supervisorType === "departmental"
                            ).comment
                          }
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedLogbook.departmentalReview?.status === "submitted" && (
                <>
                  {/* Industrial Supervisor Review Status */}
                  {selectedLogbook.industrialReview?.status !== "approved" &&
                    selectedLogbook.industrialReview?.status !== "rejected" && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 mt-0.5" />
                          <div>
                            <p className="font-medium">
                              Industrial Supervisor Review Pending
                            </p>
                            <p className="text-sm mt-1">
                              This logbook has not been reviewed by the
                              industrial supervisor yet. It's recommended to
                              wait for their review before approving.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {selectedLogbook.industrialReview?.status && (
                    <div className="bg-muted p-4 rounded-lg">
                      <Label className="text-sm font-medium">
                        Industrial Supervisor Review
                      </Label>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          <Badge
                            variant={
                              selectedLogbook.industrialReview.status ===
                              "approved"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {selectedLogbook.industrialReview.status}
                          </Badge>
                        </p>
                        {selectedLogbook.industrialReview.rating && (
                          <p className="text-sm">
                            <span className="font-medium">Rating:</span>{" "}
                            {selectedLogbook.industrialReview.rating}/10
                          </p>
                        )}
                        {selectedLogbook.industrialReview.comment && (
                          <p className="text-sm">
                            <span className="font-medium">Comment:</span>{" "}
                            {selectedLogbook.industrialReview.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium">
                      Review Decision
                    </Label>
                    <div className="flex gap-4 mt-2">
                      <Button
                        variant={
                          reviewStatus === "approved" ? "default" : "outline"
                        }
                        onClick={() => setReviewStatus("approved")}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant={
                          reviewStatus === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                        onClick={() => setReviewStatus("rejected")}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  <div>
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

                  <div>
                    <Label htmlFor="comment">Comment *</Label>
                    <Textarea
                      id="comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Provide feedback on the logbook entry..."
                      className="min-h-[100px]"
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {reviewComment.length}/1000 characters
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false);
                setReviewComment("");
                setReviewRating("");
                setReviewStatus("approved");
              }}
            >
              Close
            </Button>
            {selectedLogbook?.departmentalReview?.status === "submitted" && (
              <Button
                onClick={handleSubmitReview}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
