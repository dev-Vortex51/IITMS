import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { studentService } from "@/services/student.service";
import { logbookService, type LogbookEntry } from "@/services/logbook.service";
import { emptyLogbookForm, type LogbookFormState } from "../types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const toLocalDateInput = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useStudentLogbook = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const studentId = user?.profileData?.id;

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
  const [formData, setFormData] = useState<LogbookFormState>(emptyLogbookForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const successTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeout.current) {
        clearTimeout(successTimeout.current);
      }
    };
  }, []);

  const showSuccess = (message: string) => {
    if (successTimeout.current) {
      clearTimeout(successTimeout.current);
    }
    setSuccess(message);
    successTimeout.current = setTimeout(() => setSuccess(""), 3000);
  };

  const {
    data: placement,
    isLoading: isLoadingPlacement,
    isError: isErrorPlacement,
    refetch: refetchPlacement,
  } = useQuery({
    queryKey: ["placement", studentId],
    queryFn: () => studentService.getStudentPlacement(studentId!),
    enabled: !!studentId,
    retry: false,
  });

  const {
    data: logbooksData,
    isLoading: isLoadingLogbooks,
    isError: isErrorLogbooks,
    refetch: refetchLogbooks,
  } = useQuery({
    queryKey: ["logbooks", studentId],
    queryFn: async () => {
      const response = await logbookService.getLogbooks({
        student: studentId,
      });
      return response.data || [];
    },
    enabled: !!studentId,
  });

  const logbooks = useMemo(() => logbooksData || [], [logbooksData]);

  const activeWeekContext = useMemo(() => {
    if (!placement?.startDate || !placement?.endDate || placement?.status !== "approved") {
      return null;
    }

    const placementStart = new Date(placement.startDate);
    placementStart.setHours(0, 0, 0, 0);

    const placementEnd = new Date(placement.endDate);
    placementEnd.setHours(23, 59, 59, 999);

    const now = new Date();
    const hasStarted = now >= placementStart;
    const referenceDate = hasStarted ? (now > placementEnd ? placementEnd : now) : placementStart;
    const diff = referenceDate.getTime() - placementStart.getTime();
    const weekNumber = Math.floor(diff / WEEK_IN_MS) + 1;
    const startDate = new Date(
      placementStart.getTime() + (weekNumber - 1) * WEEK_IN_MS,
    );
    const endDateCandidate = new Date(startDate.getTime() + 6 * DAY_IN_MS);
    const endDate = endDateCandidate > placementEnd ? placementEnd : endDateCandidate;

    return {
      weekNumber,
      startDate: toLocalDateInput(startDate),
      endDate: toLocalDateInput(endDate),
      isReady: hasStarted,
      lockReason: hasStarted
        ? ""
        : `Training starts on ${toLocalDateInput(placementStart)}. You can create entries after that date.`,
    };
  }, [placement]);

  const resetForm = () => {
    setFormData(emptyLogbookForm);
    setSelectedFiles([]);
    setShowForm(false);
    setEditingEntry(null);
    setError("");
  };

  const createMutation = useMutation({
    mutationFn: (data: FormData) => logbookService.createLogbookEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks", studentId] });
      resetForm();
      showSuccess("Logbook entry created successfully");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to create logbook entry");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      logbookService.updateLogbookEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks", studentId] });
      resetForm();
      showSuccess("Logbook entry updated successfully");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update logbook entry");
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => logbookService.submitLogbookEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks", studentId] });
      showSuccess("Logbook entry submitted successfully");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to submit logbook entry");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!placement) {
      setError("No placement found. Please register your placement first.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("tasksPerformed", formData.tasksPerformed);
    formDataToSend.append("skillsAcquired", formData.skillsAcquired);
    formDataToSend.append("challenges", formData.challenges);
    formDataToSend.append("lessonsLearned", formData.lessonsLearned);

    if (!editingEntry && activeWeekContext?.isReady) {
      const weekExists = logbooks.some(
        (entry) => Number(entry.weekNumber) === Number(activeWeekContext.weekNumber),
      );
      if (weekExists) {
        setError(`A logbook entry for week ${activeWeekContext.weekNumber} already exists.`);
        return;
      }
    }

    selectedFiles.forEach((file) => {
      formDataToSend.append("evidence", file);
    });

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: formDataToSend });
    } else {
      createMutation.mutate(formDataToSend);
    }
  };

  const handleEdit = (entry: LogbookEntry) => {
    setEditingEntry(entry);
    setFormData({
      tasksPerformed: entry.tasksPerformed,
      skillsAcquired: entry.skillsAcquired || "",
      challenges: entry.challenges || "",
      lessonsLearned: entry.lessonsLearned || "",
    });
    setShowForm(true);
  };

  const handleSubmitEntry = (id: string) => {
    if (
      confirm(
        "Are you sure you want to submit this entry? You won't be able to edit it after submission.",
      )
    ) {
      submitMutation.mutate(id);
    }
  };

  return {
    studentId,
    placement,
    isLoadingPlacement,
    isErrorPlacement,
    refetchPlacement,
    logbooks,
    isLoadingLogbooks,
    isErrorLogbooks,
    refetchLogbooks,
    showForm,
    setShowForm,
    editingEntry,
    activeWeekContext,
    formData,
    setFormData,
    selectedFiles,
    setSelectedFiles,
    error,
    success,
    resetForm,
    handleSubmit,
    handleEdit,
    handleSubmitEntry,
    createMutation,
    updateMutation,
    submitMutation,
  };
};
