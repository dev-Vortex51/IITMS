"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { complianceFormService } from "@/services/compliance-form.service";
import type { ComplianceFormRecord, ComplianceTemplateItem, ComplianceFormType } from "../types";

export function useStudentCompliance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const studentId = user?.profileData?.id;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<ComplianceFormRecord | null>(null);
  const [selectedType, setSelectedType] = useState<ComplianceFormType | "">("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const templateQuery = useQuery({
    queryKey: ["compliance-template"],
    queryFn: async () => {
      const response = await complianceFormService.getTemplate();
      return (response?.data || []) as ComplianceTemplateItem[];
    },
  });

  const formsQuery = useQuery({
    queryKey: ["student-compliance-forms", studentId],
    queryFn: async () => {
      const response = await complianceFormService.getComplianceForms({ limit: 100 });
      return (response?.data || []) as ComplianceFormRecord[];
    },
    enabled: !!studentId,
  });

  const resetForm = () => {
    setSelectedType("");
    setTitle("");
    setNote("");
    setDocumentFile(null);
    setEditingForm(null);
  };

  const buildPayload = () => {
    if (!selectedType) return null;
    const payload = new FormData();
    payload.append("formType", selectedType);
    payload.append("title", title);
    payload.append("note", note);
    if (documentFile) {
      payload.append("document", documentFile);
    }
    return payload;
  };

  const createMutation = useMutation({
    mutationFn: async (payload: FormData) => complianceFormService.createComplianceForm(payload),
    onSuccess: () => {
      toast.success("Compliance form saved");
      queryClient.invalidateQueries({ queryKey: ["student-compliance-forms", studentId] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save compliance form");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormData }) =>
      complianceFormService.updateComplianceForm(id, payload),
    onSuccess: () => {
      toast.success("Compliance form updated");
      queryClient.invalidateQueries({ queryKey: ["student-compliance-forms", studentId] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update compliance form");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) => complianceFormService.submitComplianceForm(id),
    onSuccess: () => {
      toast.success("Compliance form submitted");
      queryClient.invalidateQueries({ queryKey: ["student-compliance-forms", studentId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit compliance form");
    },
  });

  const forms = useMemo(() => formsQuery.data || [], [formsQuery.data]);
  const template = useMemo(() => templateQuery.data || [], [templateQuery.data]);

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (form: ComplianceFormRecord) => {
    setEditingForm(form);
    setSelectedType(form.formType);
    setTitle(form.title || "");
    setNote(form.note || "");
    setDocumentFile(null);
    setIsDialogOpen(true);
  };

  const save = () => {
    const payload = buildPayload();
    if (!payload) {
      toast.error("Select a form type");
      return;
    }

    if (editingForm) {
      updateMutation.mutate({ id: editingForm.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  return {
    forms,
    template,
    isLoading: formsQuery.isLoading || templateQuery.isLoading,
    isDialogOpen,
    setIsDialogOpen,
    editingForm,
    selectedType,
    setSelectedType,
    title,
    setTitle,
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
