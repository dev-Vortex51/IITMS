import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { apiClient } from "@/lib/api-client";
import type { Logbook, Student } from "../types";

const getIndustrialReview = (logbook: Logbook) =>
  logbook.industrialReview ||
  logbook.reviews?.find((review) => review.supervisorType === "industrial");

const getIndustrialStatus = (logbook: Logbook) => {
  const overallStatus = (logbook.status || "").toLowerCase();
  if (overallStatus === "draft") return "draft";
  if (overallStatus === "approved" || overallStatus === "rejected") {
    return overallStatus;
  }

  const industrialReview = getIndustrialReview(logbook);
  if (industrialReview?.status) {
    return industrialReview.status.toLowerCase();
  }

  const roleStatus = (logbook.industrialReviewStatus || "").toLowerCase();
  if (["approved", "rejected", "reviewed"].includes(roleStatus)) {
    return roleStatus;
  }

  return "submitted";
};

export function useIndustrySupervisorLogbooks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supervisorId = user?.profileData?.id;

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const { searchQuery, setSearchQuery } = useUrlSearchState();

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
        let reviewed = 0;

        for (const logbook of logbooks) {
          const status = getIndustrialStatus(logbook);
          if (status === "submitted") {
            pendingReview += 1;
          } else if (
            status === "reviewed" ||
            status === "approved" ||
            status === "rejected"
          ) {
            reviewed += 1;
          }
        }

        return {
          ...student,
          logbooks,
          totalLogbooks: logbooks.length,
          pendingReview,
          reviewed,
        } satisfies Student;
      });
    },
    enabled: !!supervisorId,
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: {
      logbookId: string;
      status: "reviewed" | "rejected";
    }) => {
      const response = await apiClient.post(
        `/logbooks/${data.logbookId}/industrial-review`,
        {
          status: data.status,
        },
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
    const query = searchQuery.toLowerCase();
    if (!query) return students;

    return students.filter((student) => {
      const fullName = `${student.user?.firstName || ""} ${
        student.user?.lastName || ""
      }`.toLowerCase();

      return (
        fullName.includes(query) ||
        student.matricNumber?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, students]);

  const selectedStudentLogbooks = useMemo(
    () => selectedStudent?.logbooks || [],
    [selectedStudent],
  );

  const filteredLogbooks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return selectedStudentLogbooks.filter((logbook) => {
      const status = getIndustrialStatus(logbook);
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
        return status === "submitted";
      }
      if (statusFilter === "reviewed") {
        return status === "reviewed" || status === "approved" || status === "rejected";
      }
      return true;
    });
  }, [searchQuery, selectedStudentLogbooks, statusFilter]);

  const totalPendingReviews = useMemo(
    () => students.reduce((sum, student) => sum + (student.pendingReview || 0), 0),
    [students],
  );

  const totalLogbooks = useMemo(
    () => students.reduce((sum, student) => sum + (student.totalLogbooks || 0), 0),
    [students],
  );

  const goBackToStudents = () => {
    setSelectedStudentId(null);
    setStatusFilter("all");
  };

  const selectStudent = (student: Student | null) => {
    if (!student) {
      setSelectedStudentId(null);
      return;
    }
    setSelectedStudentId(student.id || student._id || student.matricNumber);
  };

  const openReviewDialog = (logbook: Logbook) => {
    setSelectedLogbook(logbook);
    setIsReviewDialogOpen(true);
  };

  const closeReviewDialog = () => {
    setIsReviewDialogOpen(false);
    setSelectedLogbook(null);
  };

  const submitReview = (status: "reviewed" | "rejected") => {
    if (!selectedLogbook) return;

    reviewMutation.mutate({
      logbookId: selectedLogbook.id,
      status,
    });
  };

  return {
    selectedStudent,
    setSelectedStudent: selectStudent,
    selectedLogbook,
    isReviewDialogOpen,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    students,
    filteredStudents,
    filteredLogbooks,
    totalPendingReviews,
    totalLogbooks,
    openReviewDialog,
    closeReviewDialog,
    goBackToStudents,
    submitReview,
    isLoading: studentsQuery.isLoading,
    isError: studentsQuery.isError,
    error: studentsQuery.error,
    retry: studentsQuery.refetch,
    isSubmittingReview: reviewMutation.isPending,
  };
}
