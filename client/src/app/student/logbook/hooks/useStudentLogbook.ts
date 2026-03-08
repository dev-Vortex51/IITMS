/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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

const OFFLINE_DRAFT_ID_PREFIX = "offline-draft-";

interface OfflineLogbookDraft {
  id: string;
  studentId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  payload: LogbookFormState;
  pendingSubmit: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OfflineLogbookAction {
  id: string;
  studentId: string;
  type: "update" | "submit";
  entryId: string;
  payload?: LogbookFormState;
  createdAt: string;
}

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const getEntryId = (entry: LogbookEntry) => String((entry as any).id || (entry as any)._id || "");
const isOfflineDraftId = (id: string) => id.startsWith(OFFLINE_DRAFT_ID_PREFIX);

const toFormData = (payload: LogbookFormState) => {
  const data = new FormData();
  data.append("tasksPerformed", payload.tasksPerformed);
  data.append("skillsAcquired", payload.skillsAcquired);
  data.append("challenges", payload.challenges);
  data.append("lessonsLearned", payload.lessonsLearned);
  return data;
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
  const [isOnline, setIsOnline] = useState(true);
  const [cachedPlacement, setCachedPlacement] = useState<any | null>(null);
  const [cachedLogbooks, setCachedLogbooks] = useState<LogbookEntry[]>([]);
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineLogbookDraft[]>([]);
  const [offlineActions, setOfflineActions] = useState<OfflineLogbookAction[]>([]);
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);
  const successTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncInFlight = useRef(false);
  const draftPersistTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionPersistTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const placementCacheKey = studentId ? `itms:student:placement:${studentId}` : "";
  const logbooksCacheKey = studentId ? `itms:student:logbooks:${studentId}` : "";
  const offlineDraftsKey = studentId ? `itms:student:logbooks:offline-drafts:${studentId}` : "";
  const offlineActionsKey = studentId ? `itms:student:logbooks:offline-actions:${studentId}` : "";

  useEffect(() => {
    return () => {
      if (successTimeout.current) {
        clearTimeout(successTimeout.current);
      }
      if (draftPersistTimeout.current) {
        clearTimeout(draftPersistTimeout.current);
      }
      if (actionPersistTimeout.current) {
        clearTimeout(actionPersistTimeout.current);
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsOnline(window.navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!studentId) {
      setCachedPlacement(null);
      setCachedLogbooks([]);
      setOfflineDrafts([]);
      setOfflineActions([]);
      return;
    }

    setCachedPlacement(readJson(placementCacheKey, null));
    setCachedLogbooks(readJson<LogbookEntry[]>(logbooksCacheKey, []));
    setOfflineDrafts(readJson<OfflineLogbookDraft[]>(offlineDraftsKey, []));
    setOfflineActions(readJson<OfflineLogbookAction[]>(offlineActionsKey, []));
  }, [studentId, placementCacheKey, logbooksCacheKey, offlineDraftsKey, offlineActionsKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !studentId) {
      return;
    }
    if (draftPersistTimeout.current) {
      clearTimeout(draftPersistTimeout.current);
    }
    draftPersistTimeout.current = setTimeout(() => {
      window.localStorage.setItem(offlineDraftsKey, JSON.stringify(offlineDrafts));
      draftPersistTimeout.current = null;
    }, 300);

    return () => {
      if (draftPersistTimeout.current) {
        clearTimeout(draftPersistTimeout.current);
        draftPersistTimeout.current = null;
      }
    };
  }, [offlineDrafts, offlineDraftsKey, studentId]);

  useEffect(() => {
    if (typeof window === "undefined" || !studentId) {
      return;
    }
    if (actionPersistTimeout.current) {
      clearTimeout(actionPersistTimeout.current);
    }
    actionPersistTimeout.current = setTimeout(() => {
      window.localStorage.setItem(offlineActionsKey, JSON.stringify(offlineActions));
      actionPersistTimeout.current = null;
    }, 300);

    return () => {
      if (actionPersistTimeout.current) {
        clearTimeout(actionPersistTimeout.current);
        actionPersistTimeout.current = null;
      }
    };
  }, [offlineActions, offlineActionsKey, studentId]);

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
    retry: false,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !studentId) {
      return;
    }
    if (placement === undefined) {
      return;
    }
    setCachedPlacement(placement ?? null);
    window.localStorage.setItem(placementCacheKey, JSON.stringify(placement ?? null));
  }, [placement, placementCacheKey, studentId]);

  useEffect(() => {
    if (typeof window === "undefined" || !studentId || !logbooksData) {
      return;
    }
    setCachedLogbooks(logbooksData);
    window.localStorage.setItem(logbooksCacheKey, JSON.stringify(logbooksData));
  }, [logbooksData, logbooksCacheKey, studentId]);

  const resolvedPlacement = placement ?? (!isOnline ? cachedPlacement : null);

  const logbooks = useMemo(() => {
    const baseLogbooks = (logbooksData || (!isOnline ? cachedLogbooks : [])) as LogbookEntry[];
    const studentOfflineDrafts = studentId
      ? offlineDrafts.filter((draft) => draft.studentId === studentId)
      : [];
    const studentOfflineActions = studentId
      ? offlineActions.filter((action) => action.studentId === studentId)
      : [];

    const pendingUpdateByEntry = new Map<string, LogbookFormState>();
    const pendingSubmitByEntry = new Set<string>();

    studentOfflineActions.forEach((action) => {
      if (action.type === "update" && action.payload) {
        pendingUpdateByEntry.set(action.entryId, action.payload);
      }
      if (action.type === "submit") {
        pendingSubmitByEntry.add(action.entryId);
      }
    });

    const mergedRemote = baseLogbooks.map((entry) => {
      const id = getEntryId(entry);
      const queuedUpdate = pendingUpdateByEntry.get(id);
      const queuedSubmit = pendingSubmitByEntry.has(id);

      return {
        ...entry,
        ...(queuedUpdate || {}),
        status: queuedSubmit ? "submitted" : entry.status,
      };
    });

    const localDraftEntries: LogbookEntry[] = studentOfflineDrafts.map((draft) => ({
      id: draft.id,
      _id: draft.id,
      student: null,
      weekNumber: draft.weekNumber,
      startDate: draft.startDate,
      endDate: draft.endDate,
      tasksPerformed: draft.payload.tasksPerformed,
      skillsAcquired: draft.payload.skillsAcquired,
      challenges: draft.payload.challenges,
      lessonsLearned: draft.payload.lessonsLearned,
      evidence: [],
      status: draft.pendingSubmit ? "submitted" : "draft",
      submittedAt: draft.pendingSubmit ? draft.updatedAt : undefined,
      reviews: [],
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));

    return [...mergedRemote, ...localDraftEntries].sort((a, b) => {
      const weekDiff = Number(b.weekNumber || 0) - Number(a.weekNumber || 0);
      if (weekDiff !== 0) {
        return weekDiff;
      }
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });
  }, [logbooksData, isOnline, cachedLogbooks, studentId, offlineDrafts, offlineActions]);

  const pendingSyncCount = useMemo(() => {
    if (!studentId) {
      return 0;
    }
    const draftCount = offlineDrafts.filter((draft) => draft.studentId === studentId).length;
    const actionCount = offlineActions.filter((action) => action.studentId === studentId).length;
    return draftCount + actionCount;
  }, [offlineActions, offlineDrafts, studentId]);

  const activeWeekContext = useMemo(() => {
    if (
      !resolvedPlacement?.startDate ||
      !resolvedPlacement?.endDate ||
      resolvedPlacement?.status !== "approved"
    ) {
      return null;
    }

    const placementStart = new Date(resolvedPlacement.startDate);
    placementStart.setHours(0, 0, 0, 0);

    const placementEnd = new Date(resolvedPlacement.endDate);
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
  }, [resolvedPlacement]);

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

  const syncOfflineChanges = useCallback(async () => {
    if (!studentId || !isOnline || syncInFlight.current) {
      return;
    }

    const studentDrafts = offlineDrafts.filter((draft) => draft.studentId === studentId);
    const studentActions = offlineActions.filter((action) => action.studentId === studentId);
    if (studentDrafts.length === 0 && studentActions.length === 0) {
      return;
    }

    syncInFlight.current = true;
    setIsSyncingOffline(true);

    const remainingDrafts: OfflineLogbookDraft[] = [];
    const remainingActions: OfflineLogbookAction[] = [];
    let successCount = 0;

    for (const draft of studentDrafts) {
      try {
        const createdEntry = await logbookService.createLogbookEntry(toFormData(draft.payload));
        if (draft.pendingSubmit) {
          const createdId = getEntryId(createdEntry);
          if (createdId) {
            await logbookService.submitLogbookEntry(createdId);
          }
        }
        successCount += 1;
      } catch {
        remainingDrafts.push(draft);
      }
    }

    for (const action of studentActions) {
      try {
        if (action.type === "update" && action.payload) {
          await logbookService.updateLogbookEntry(action.entryId, toFormData(action.payload));
        } else if (action.type === "submit") {
          await logbookService.submitLogbookEntry(action.entryId);
        }
        successCount += 1;
      } catch {
        remainingActions.push(action);
      }
    }

    setOfflineDrafts((prev) => [
      ...prev.filter((draft) => draft.studentId !== studentId),
      ...remainingDrafts,
    ]);
    setOfflineActions((prev) => [
      ...prev.filter((action) => action.studentId !== studentId),
      ...remainingActions,
    ]);

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["logbooks", studentId] });
      showSuccess("Offline logbook changes synced.");
    }
    if (remainingDrafts.length > 0 || remainingActions.length > 0) {
      setError("Some offline logbook changes could not sync yet. They will retry automatically.");
    }

    setIsSyncingOffline(false);
    syncInFlight.current = false;
  }, [studentId, isOnline, offlineDrafts, offlineActions, queryClient]);

  useEffect(() => {
    if (!isOnline || pendingSyncCount === 0) {
      return;
    }

    void syncOfflineChanges();
  }, [isOnline, pendingSyncCount, syncOfflineChanges]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resolvedPlacement) {
      setError("No placement found. Please register your placement first.");
      return;
    }

    if (!editingEntry && activeWeekContext?.isReady) {
      const weekExists = logbooks.some(
        (entry) => Number(entry.weekNumber) === Number(activeWeekContext.weekNumber),
      );
      if (weekExists) {
        setError(`A logbook entry for week ${activeWeekContext.weekNumber} already exists.`);
        return;
      }
    }

    if (!isOnline) {
      if (!studentId) {
        setError("Unable to save offline draft. Missing student identity.");
        return;
      }

      if (!editingEntry && !activeWeekContext?.isReady) {
        setError(activeWeekContext?.lockReason || "This week is not available yet.");
        return;
      }

      if (selectedFiles.length > 0) {
        showSuccess("Draft saved offline without evidence files. Upload evidence when online.");
      }

      if (editingEntry) {
        const editingId = getEntryId(editingEntry);
        const now = new Date().toISOString();

        if (isOfflineDraftId(editingId)) {
          setOfflineDrafts((prev) =>
            prev.map((draft) =>
              draft.id === editingId
                ? {
                    ...draft,
                    payload: formData,
                    updatedAt: now,
                  }
                : draft,
            ),
          );
        } else {
          const queued: OfflineLogbookAction = {
            id: `offline-action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            studentId,
            type: "update",
            entryId: editingId,
            payload: formData,
            createdAt: now,
          };
          setOfflineActions((prev) => {
            const rest = prev.filter(
              (action) =>
                !(
                  action.studentId === studentId &&
                  action.type === "update" &&
                  action.entryId === editingId
                ),
            );
            return [...rest, queued];
          });
        }
      } else {
        const now = new Date().toISOString();
        const offlineDraft: OfflineLogbookDraft = {
          id: `${OFFLINE_DRAFT_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          studentId,
          weekNumber: activeWeekContext?.weekNumber || 0,
          startDate: activeWeekContext?.startDate || toLocalDateInput(new Date()),
          endDate: activeWeekContext?.endDate || toLocalDateInput(new Date()),
          payload: formData,
          pendingSubmit: false,
          createdAt: now,
          updatedAt: now,
        };
        setOfflineDrafts((prev) => [...prev, offlineDraft]);
      }

      resetForm();
      showSuccess("Logbook draft saved offline. It will sync automatically when online.");
      return;
    }

    const formDataToSend = toFormData(formData);
    selectedFiles.forEach((file) => {
      formDataToSend.append("evidence", file);
    });

    if (editingEntry) {
      const entryId = editingEntry.id || editingEntry._id;
      if (!entryId) {
        setError("Unable to update this logbook entry. Missing entry ID.");
        return;
      }
      if (isOfflineDraftId(String(entryId))) {
        const now = new Date().toISOString();
        setOfflineDrafts((prev) =>
          prev.map((draft) =>
            draft.id === String(entryId)
              ? {
                  ...draft,
                  payload: formData,
                  updatedAt: now,
                }
              : draft,
          ),
        );
        resetForm();
        void syncOfflineChanges();
        return;
      }
      updateMutation.mutate({ id: entryId, data: formDataToSend });
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
    if (!studentId) {
      setError("Unable to submit this entry.");
      return;
    }

    if (!isOnline || isOfflineDraftId(id)) {
      if (isOfflineDraftId(id)) {
        const now = new Date().toISOString();
        setOfflineDrafts((prev) =>
          prev.map((draft) =>
            draft.id === id
              ? {
                  ...draft,
                  pendingSubmit: true,
                  updatedAt: now,
                }
              : draft,
          ),
        );
      } else {
        const action: OfflineLogbookAction = {
          id: `offline-action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          studentId,
          type: "submit",
          entryId: id,
          createdAt: new Date().toISOString(),
        };
        setOfflineActions((prev) => {
          const rest = prev.filter(
            (queued) =>
              !(
                queued.studentId === studentId &&
                queued.type === "submit" &&
                queued.entryId === id
              ),
          );
          return [...rest, action];
        });
      }

      showSuccess(
        isOnline
          ? "Submission queued and syncing."
          : "Submission queued offline. It will sync when internet returns.",
      );
      if (isOnline) {
        void syncOfflineChanges();
      }
      return;
    }

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
    placement: resolvedPlacement,
    isLoadingPlacement: isLoadingPlacement && !resolvedPlacement,
    isErrorPlacement: isErrorPlacement && !resolvedPlacement,
    refetchPlacement,
    logbooks,
    isLoadingLogbooks: isLoadingLogbooks && logbooks.length === 0,
    isErrorLogbooks: isErrorLogbooks && logbooks.length === 0,
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
    isOnline,
    pendingSyncCount,
    isSyncingOffline,
    syncOfflineChanges,
  };
};
