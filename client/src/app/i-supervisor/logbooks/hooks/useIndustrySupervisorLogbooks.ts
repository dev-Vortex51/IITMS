/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { apiClient } from "@/lib/api-client";
import type { Logbook, Student } from "../types";

const OFFLINE_REVIEWS_KEY = "itms:i-supervisor:offline-logbook-reviews";
const STUDENTS_CACHE_KEY_PREFIX = "itms:i-supervisor:students:";

interface OfflineReviewAction {
  id: string;
  supervisorId: string;
  logbookId: string;
  status: "reviewed" | "rejected";
  createdAt: string;
}

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
  const studentsCacheKey = supervisorId ? `${STUDENTS_CACHE_KEY_PREFIX}${supervisorId}` : "";

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOnline, setIsOnline] = useState(true);
  const [cachedStudents, setCachedStudents] = useState<Student[]>([]);
  const [offlineReviewQueue, setOfflineReviewQueue] = useState<OfflineReviewAction[]>([]);
  const [isSyncingOfflineReviews, setIsSyncingOfflineReviews] = useState(false);
  const syncInFlight = useRef(false);
  const { searchQuery, setSearchQuery } = useUrlSearchState();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setIsOnline(window.navigator.onLine);

    const rawQueue = window.localStorage.getItem(OFFLINE_REVIEWS_KEY);
    if (rawQueue) {
      try {
        setOfflineReviewQueue(JSON.parse(rawQueue) as OfflineReviewAction[]);
      } catch {
        setOfflineReviewQueue([]);
      }
    }

    if (studentsCacheKey) {
      const rawStudents = window.localStorage.getItem(studentsCacheKey);
      if (rawStudents) {
        try {
          setCachedStudents(JSON.parse(rawStudents) as Student[]);
        } catch {
          setCachedStudents([]);
        }
      }
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [studentsCacheKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      OFFLINE_REVIEWS_KEY,
      JSON.stringify(offlineReviewQueue),
    );
  }, [offlineReviewQueue]);

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
    retry: false,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !studentsCacheKey || !studentsQuery.data) {
      return;
    }
    setCachedStudents(studentsQuery.data);
    window.localStorage.setItem(studentsCacheKey, JSON.stringify(studentsQuery.data));
  }, [studentsCacheKey, studentsQuery.data]);

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

  const syncOfflineReviews = useCallback(async () => {
    if (!isOnline || !supervisorId || syncInFlight.current) {
      return;
    }

    const pending = offlineReviewQueue.filter((item) => item.supervisorId === supervisorId);
    if (pending.length === 0) {
      return;
    }

    syncInFlight.current = true;
    setIsSyncingOfflineReviews(true);
    const remaining: OfflineReviewAction[] = [];
    let synced = 0;

    for (const review of pending) {
      try {
        await apiClient.post(`/logbooks/${review.logbookId}/industrial-review`, {
          status: review.status,
        });
        synced += 1;
      } catch {
        remaining.push(review);
      }
    }

    setOfflineReviewQueue((prev) => [
      ...prev.filter((item) => item.supervisorId !== supervisorId),
      ...remaining,
    ]);

    if (synced > 0) {
      toast.success("Queued logbook reviews synced.");
      queryClient.invalidateQueries({ queryKey: ["supervisor-students", supervisorId] });
      queryClient.invalidateQueries({ queryKey: ["supervisor-dashboard", supervisorId] });
    }
    if (remaining.length > 0) {
      toast.error("Some queued reviews could not sync yet.");
    }

    setIsSyncingOfflineReviews(false);
    syncInFlight.current = false;
  }, [isOnline, supervisorId, offlineReviewQueue, queryClient]);

  useEffect(() => {
    if (isOnline) {
      void syncOfflineReviews();
    }
  }, [isOnline, syncOfflineReviews]);

  const students = useMemo<Student[]>(() => {
    const baseStudents = (studentsQuery.data || (!isOnline ? cachedStudents : [])) as Student[];
    if (!supervisorId) {
      return baseStudents;
    }

    const queuedByLogbookId = new Map<string, OfflineReviewAction>();
    offlineReviewQueue
      .filter((item) => item.supervisorId === supervisorId)
      .forEach((item) => queuedByLogbookId.set(item.logbookId, item));

    return baseStudents.map((student) => {
      const studentLogbooks = (student.logbooks || []).map((logbook) => {
        const queued = queuedByLogbookId.get(logbook.id);
        if (!queued) {
          return logbook;
        }
        return {
          ...logbook,
          industrialReviewStatus: queued.status,
          industrialReview: {
            ...(logbook.industrialReview || {}),
            supervisorType: "industrial",
            status: queued.status,
            comment:
              logbook.industrialReview?.comment ||
              "Queued offline review, pending sync.",
            reviewedAt: queued.createdAt,
          },
        };
      });

      let pendingReview = 0;
      let reviewed = 0;
      for (const logbook of studentLogbooks) {
        const status = getIndustrialStatus(logbook);
        if (status === "submitted") {
          pendingReview += 1;
        } else if (status === "reviewed" || status === "approved" || status === "rejected") {
          reviewed += 1;
        }
      }

      return {
        ...student,
        logbooks: studentLogbooks,
        totalLogbooks: studentLogbooks.length,
        pendingReview,
        reviewed,
      };
    });
  }, [studentsQuery.data, isOnline, cachedStudents, supervisorId, offlineReviewQueue]);
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

    if (!isOnline) {
      if (!supervisorId) {
        toast.error("Unable to queue review. Missing supervisor profile.");
        return;
      }
      setOfflineReviewQueue((prev) => [
        ...prev.filter(
          (item) =>
            !(
              item.supervisorId === supervisorId &&
              item.logbookId === selectedLogbook.id
            ),
        ),
        {
          id: `offline-review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          supervisorId,
          logbookId: selectedLogbook.id,
          status,
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.info("Review queued offline. It will sync automatically when online.");
      closeReviewDialog();
      return;
    }

    reviewMutation.mutate({
      logbookId: selectedLogbook.id,
      status,
    });
  };

  const pendingOfflineReviews = useMemo(() => {
    if (!supervisorId) {
      return 0;
    }
    return offlineReviewQueue.filter((item) => item.supervisorId === supervisorId).length;
  }, [offlineReviewQueue, supervisorId]);

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
    isOnline,
    pendingOfflineReviews,
    isSyncingOfflineReviews,
    syncOfflineReviews,
  };
}
