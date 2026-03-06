import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { studentService, placementService } from "@/services/student.service";
import { toast } from "sonner";
import type { PlacementFormData } from "../types";

const defaultFormData: PlacementFormData = {
  companyName: "",
  companyAddress: "",
  companySector: "",
  companyEmail: "",
  companyPhone: "",
  position: "",
  startDate: "",
  endDate: "",
  supervisorName: "",
  supervisorEmail: "",
  supervisorPhone: "",
  supervisorPosition: "",
};

export function useStudentPlacement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PlacementFormData>(defaultFormData);

  const studentProfileId = user?.profileData?.id;

  const studentQuery = useQuery({
    queryKey: ["student", studentProfileId],
    queryFn: async () => {
      if (!studentProfileId) {
        throw new Error("Student profile not found");
      }
      return studentService.getStudentById(studentProfileId);
    },
    enabled: !!studentProfileId,
  });

  useEffect(() => {
    if (studentQuery.error) {
      toast.error("Failed to load student data. Please refresh.");
    }
  }, [studentQuery.error]);

  const student = studentQuery.data;

  const placementQuery = useQuery({
    queryKey: ["placement", student?.id],
    queryFn: () => studentService.getStudentPlacement(student!.id),
    enabled: !!student?.id,
    retry: false,
  });

  const placement = placementQuery.data;

  const invalidatePlacementQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["student", studentProfileId] });
    queryClient.invalidateQueries({ queryKey: ["placement"] });
    queryClient.refetchQueries({ queryKey: ["placement", student?.id] });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => placementService.createPlacement(data),
    onSuccess: () => {
      invalidatePlacementQueries();
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      toast.success("Placement submitted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit placement");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      if (!placement?.id) throw new Error("Placement not found");
      return placementService.updatePlacement(placement.id, data);
    },
    onSuccess: () => {
      invalidatePlacementQueries();
      setIsDialogOpen(false);
      toast.success("Placement updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update placement");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => {
      if (!placement?.id) throw new Error("Placement not found");
      return placementService.withdrawPlacement(placement.id);
    },
    onSuccess: () => {
      invalidatePlacementQueries();
      toast.success("Placement withdrawn successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to withdraw placement");
    },
  });

  const openEditDialog = () => {
    if (!placement) return;
    setFormData({
      companyName: placement.companyName || "",
      companyAddress: placement.companyAddress || "",
      companySector: placement.companySector || "",
      companyEmail: placement.companyEmail || "",
      companyPhone: placement.companyPhone || "",
      position: placement.position || "",
      startDate: placement.startDate?.split("T")[0] || "",
      endDate: placement.endDate?.split("T")[0] || "",
      supervisorName: placement.supervisorName || "",
      supervisorEmail: placement.supervisorEmail || "",
      supervisorPhone: placement.supervisorPhone || "",
      supervisorPosition: placement.supervisorPosition || "",
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const createPayload = useMemo(() => {
    if (!student?.id) return null;
    return {
      student: student.id,
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companySector: formData.companySector,
      companyEmail: formData.companyEmail,
      companyPhone: formData.companyPhone,
      position: formData.position,
      startDate: formData.startDate,
      endDate: formData.endDate,
      supervisorName: formData.supervisorName,
      supervisorEmail: formData.supervisorEmail,
      supervisorPhone: formData.supervisorPhone,
      supervisorPosition: formData.supervisorPosition,
    };
  }, [formData, student?.id]);

  const updatePayload = useMemo(() => {
    return {
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companySector: formData.companySector,
      companyEmail: formData.companyEmail,
      companyPhone: formData.companyPhone,
      position: formData.position,
      startDate: formData.startDate,
      endDate: formData.endDate,
      supervisorName: formData.supervisorName,
      supervisorEmail: formData.supervisorEmail,
      supervisorPhone: formData.supervisorPhone,
      supervisorPosition: formData.supervisorPosition,
    };
  }, [formData]);

  return {
    student,
    placement,
    isDialogOpen,
    setIsDialogOpen,
    formData,
    setFormData,
    openEditDialog,
    openNewDialog,
    createMutation,
    updateMutation,
    withdrawMutation,
    createPayload,
    updatePayload,
    isLoadingStudent: studentQuery.isLoading,
    isLoadingPlacement: placementQuery.isLoading,
    isErrorStudent: studentQuery.isError,
    isErrorPlacement: placementQuery.isError,
    refetchStudent: studentQuery.refetch,
    refetchPlacement: placementQuery.refetch,
  };
}
