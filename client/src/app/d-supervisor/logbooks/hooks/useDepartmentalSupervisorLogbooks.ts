import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { apiClient } from "@/lib/api-client";
import type {
  Logbook,
  Student,
} from "../types";

const getDepartmentalReview = (logbook: Logbook) =>
  logbook.departmentalReview ||
  logbook.reviews?.find(
    (review) =>
      review.supervisorType === "departmental" ||
      review.supervisorType === "academic",
  );

const getDepartmentalStatus = (logbook: Logbook) =>
  (logbook.status || "").toLowerCase() ||
  getDepartmentalReview(logbook)?.status ||
  logbook.departmentalReviewStatus ||
  "draft";

export function useDepartmentalSupervisorLogbooks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supervisorId = user?.profileData?.id;

  const { searchQuery, setSearchQuery } = useUrlSearchState();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const studentsQuery = useQuery({
    queryKey: ["supervisor-students", supervisorId],
    queryFn: async () => {
      const [dashboardResponse, logbooksResponse] = await Promise.all([
        apiClient.get(`/supervisors/${supervisorId}/dashboard`),
        apiClient.get("/logbooks"),
      ]);
      const assignedStudents =
        dashboardResponse.data.data?.supervisor?.assignedStudents || [];
      const allLogbooks: Logbook[] = logbooksResponse.data.data || [];
      const logbooksByStudent = allLogbooks.reduce(
        (acc, logbook) => {
          if (!acc[logbook.studentId]) {
            acc[logbook.studentId] = [];
          }
          acc[logbook.studentId].push(logbook);
          return acc;
        },
        {} as Record<string, Logbook[]>,
      );

      return assignedStudents.map((student: any) => {
        const logbooks = logbooksByStudent[student.id] || [];
        let pendingReview = 0;
        let approved = 0;
        let rejected = 0;

        for (const logbook of logbooks) {
          const status = getDepartmentalStatus(logbook);
          if (status === "reviewed") pendingReview += 1;
          if (status === "approved") approved += 1;
          if (status === "rejected") rejected += 1;
        }

        return {
          ...student,
          logbooks,
          totalLogbooks: logbooks.length,
          pendingReview,
          approved,
          rejected,
        } satisfies Student;
      });
    },
    enabled: !!supervisorId,
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: {
      logbookId: string;
      comment: string;
    }) => {
      const response = await apiClient.post(`/logbooks/${data.logbookId}/review`, {
        comment: data.comment,
        status: "approved",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-students"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor-dashboard"] });
      toast.success("Logbook review submitted successfully");
      closeReviewDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const students = useMemo<Student[]>(() => studentsQuery.data || [], [studentsQuery.data]);
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return (
      students.find(
        (student) =>
          student.id === selectedStudentId ||
          student._id === selectedStudentId ||
          student.matricNumber === selectedStudentId,
      ) || null
    );
  }, [selectedStudentId, students]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;

    const query = searchQuery.toLowerCase();
    return students.filter((student) => {
      return (
        student.user?.firstName?.toLowerCase().includes(query) ||
        student.user?.lastName?.toLowerCase().includes(query) ||
        student.matricNumber?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, students]);

  const filteredLogbooks = useMemo(() => {
    if (!selectedStudent?.logbooks) return [];
    const query = searchQuery.toLowerCase().trim();

    return selectedStudent.logbooks.filter((logbook) => {
      const status = getDepartmentalStatus(logbook);
      const searchMatches =
        !query ||
        String(logbook.weekNumber || "")
          .toLowerCase()
          .includes(query) ||
        (logbook.tasksPerformed || "").toLowerCase().includes(query) ||
        (logbook.skillsAcquired || "").toLowerCase().includes(query) ||
        (logbook.challenges || "").toLowerCase().includes(query) ||
        (logbook.lessonsLearned || "").toLowerCase().includes(query);

      if (!searchMatches) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") {
        return status === "reviewed";
      }
      if (statusFilter === "approved") {
        return status === "approved";
      }
      return true;
    });
  }, [searchQuery, selectedStudent, statusFilter]);

  const totalPendingReviews = useMemo(
    () => students.reduce((sum, student) => sum + (student.pendingReview || 0), 0),
    [students],
  );

  const totalReviewed = useMemo(
    () =>
      students.reduce(
        (sum, student) => sum + (student.approved || 0),
        0,
      ),
    [students],
  );

  const selectStudent = (student: Student) => {
    setSelectedStudentId(student.id || student._id || student.matricNumber);
    setSearchQuery("");
    setStatusFilter("all");
  };

  const clearSelectedStudent = () => {
    setSelectedStudentId(null);
    setSearchQuery("");
    setStatusFilter("all");
  };

  const openReviewDialog = (logbook: Logbook) => {
    setSelectedLogbook(logbook);
    setIsReviewDialogOpen(true);
  };

  const closeReviewDialog = () => {
    setIsReviewDialogOpen(false);
    setSelectedLogbook(null);
  };

  const submitReview = () => {
    if (!selectedLogbook) return;

    reviewMutation.mutate({
      logbookId: selectedLogbook.id,
      comment: "Approved by departmental supervisor",
    });
  };

  return {
    students,
    filteredStudents,
    filteredLogbooks,
    selectedStudent,
    selectStudent,
    clearSelectedStudent,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedLogbook,
    openReviewDialog,
    closeReviewDialog,
    isReviewDialogOpen,
    submitReview,
    isSubmittingReview: reviewMutation.isPending,
    totalPendingReviews,
    totalReviewed,
    isLoading: studentsQuery.isLoading,
    isError: studentsQuery.isError,
    error: studentsQuery.error,
    retry: studentsQuery.refetch,
  };
}
