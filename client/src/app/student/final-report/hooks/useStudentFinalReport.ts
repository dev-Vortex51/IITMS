"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { technicalReportService } from "@/services/technical-report.service";
import type { TechnicalReportRecord } from "../types";

export function useStudentFinalReport() {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [note, setNote] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const reportQuery = useQuery({
    queryKey: ["student-final-report"],
    queryFn: async () => {
      const response = await technicalReportService.getTechnicalReports({ limit: 1 });
      const reports = (response?.data || []) as TechnicalReportRecord[];
      return reports[0] || null;
    },
  });

  const resetForm = () => {
    setTitle("");
    setAbstractText("");
    setNote("");
    setDocumentFile(null);
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("title", title);
    payload.append("abstract", abstractText);
    payload.append("note", note);
    if (documentFile) {
      payload.append("document", documentFile);
    }
    return payload;
  };

  const createMutation = useMutation({
    mutationFn: async (payload: FormData) => technicalReportService.createTechnicalReport(payload),
    onSuccess: () => {
      toast.success("Final report saved");
      queryClient.invalidateQueries({ queryKey: ["student-final-report"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save report");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormData }) =>
      technicalReportService.updateTechnicalReport(id, payload),
    onSuccess: () => {
      toast.success("Final report updated");
      queryClient.invalidateQueries({ queryKey: ["student-final-report"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update report");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) => technicalReportService.submitTechnicalReport(id),
    onSuccess: () => {
      toast.success("Final report submitted");
      queryClient.invalidateQueries({ queryKey: ["student-final-report"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit report");
    },
  });

  const report = useMemo(() => reportQuery.data, [reportQuery.data]);

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = () => {
    if (!report) return;
    setTitle(report.title || "");
    setAbstractText(report.abstract || "");
    setNote(report.note || "");
    setDocumentFile(null);
    setIsDialogOpen(true);
  };

  const save = () => {
    const payload = buildPayload();
    if (report?.id) {
      updateMutation.mutate({ id: report.id, payload });
      return;
    }
    createMutation.mutate(payload);
  };

  return {
    report,
    isLoading: reportQuery.isLoading,
    isDialogOpen,
    setIsDialogOpen,
    title,
    setTitle,
    abstractText,
    setAbstractText,
    note,
    setNote,
    documentFile,
    setDocumentFile,
    openCreate,
    openEdit,
    save,
    createMutation,
    updateMutation,
    submitMutation,
  };
}
