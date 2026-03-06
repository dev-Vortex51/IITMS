import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService, placementService } from "@/services/student.service";
import adminService from "@/services/admin.service";
import { toast } from "sonner";

export function useSupervisorAssignment(studentId: string) {
  const queryClient = useQueryClient();

  const [departmentalSupervisorId, setDepartmentalSupervisorId] = useState("");
  const [industrialSupervisorId, setIndustrialSupervisorId] = useState("");
  const [error, setError] = useState("");

  // 1. Fetch Core Data
  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => studentService.getStudentById(studentId),
    enabled: !!studentId,
  });

  const { data: placement, isLoading: placementLoading } = useQuery({
    queryKey: ["placement", studentId],
    queryFn: () => studentService.getStudentPlacement(studentId),
    enabled: !!studentId,
  });

  // 2. Fetch Suggestions
  const { data: academicSuggestionsData } = useQuery({
    queryKey: ["supervisors", "suggestions", "academic", studentId],
    queryFn: () =>
      adminService.supervisorService.getSupervisorSuggestions(
        studentId,
        "academic",
      ),
    enabled: !!studentId,
  });

  const { data: industrialSuggestionsData } = useQuery({
    queryKey: ["supervisors", "suggestions", "industrial", studentId],
    queryFn: () =>
      adminService.supervisorService.getSupervisorSuggestions(
        studentId,
        "industrial",
      ),
    enabled: !!studentId,
  });

  // 3. Fetch All Supervisors
  const { data: dSupervisorsData } = useQuery({
    queryKey: ["supervisors", "departmental"],
    queryFn: () =>
      adminService.supervisorService.getAllSupervisors({
        type: "departmental",
      }),
  });

  const { data: industrialSupervisorsData } = useQuery({
    queryKey: ["supervisors", "industrial", placement?.companyName],
    queryFn: () => {
      const params: any = { type: "industrial" };
      if (placement?.companyName) params.companyName = placement.companyName;
      return adminService.supervisorService.getAllSupervisors(params);
    },
    enabled: !!placement,
  });

  // Process Lists
  const academicSuggestions = useMemo(
    () => academicSuggestionsData?.data || [],
    [academicSuggestionsData],
  );
  const industrialSuggestions = useMemo(
    () => industrialSuggestionsData?.data || [],
    [industrialSuggestionsData],
  );
  const departmentalSupervisors = useMemo(
    () => dSupervisorsData?.data || [],
    [dSupervisorsData],
  );
  const industrialSupervisors = useMemo(
    () => industrialSupervisorsData?.data || [],
    [industrialSupervisorsData],
  );

  const academicList = useMemo(
    () =>
      departmentalSupervisors.length
        ? departmentalSupervisors
        : academicSuggestions,
    [departmentalSupervisors, academicSuggestions],
  );
  const industrialList = useMemo(
    () =>
      industrialSuggestions.length
        ? industrialSuggestions
        : industrialSupervisors,
    [industrialSuggestions, industrialSupervisors],
  );

  // 4. Synchronize state with fetched data
  useEffect(() => {
    const existingAcademicSupervisor =
      student?.departmentalSupervisor || student?.academicSupervisor;

    if (existingAcademicSupervisor) {
      const dsId =
        typeof existingAcademicSupervisor === "object"
          ? existingAcademicSupervisor.id
          : existingAcademicSupervisor;
      setDepartmentalSupervisorId(dsId || "");
    } else if (!departmentalSupervisorId && academicSuggestions.length > 0) {
      setDepartmentalSupervisorId(academicSuggestions[0].id);
    }

    if (student?.industrialSupervisor) {
      const isId =
        typeof student.industrialSupervisor === "object"
          ? student.industrialSupervisor.id
          : student.industrialSupervisor;
      setIndustrialSupervisorId(isId || "");
    } else if (!industrialSupervisorId && industrialSuggestions.length > 0) {
      setIndustrialSupervisorId(industrialSuggestions[0].id);
    }
  }, [
    student,
    academicSuggestions,
    industrialSuggestions,
    departmentalSupervisorId,
    industrialSupervisorId,
  ]);

  // 5. Mutations
  const updateMutation = useMutation({
    mutationFn: async (data: {
      departmentalSupervisor?: string;
      industrialSupervisor?: string;
    }) => {
      if (!placement) throw new Error("No placement found");
      return placementService.updatePlacementByCoordinator(placement.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement", studentId] });
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      setError("");
      toast.success("Supervisors assigned successfully");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to assign supervisor";
      setError(msg);
      toast.error(msg);
    },
  });

  const handleSave = () => {
    if (!departmentalSupervisorId) {
      setError("Please select an academic supervisor");
      return;
    }

    const payload: {
      departmentalSupervisor?: string;
      industrialSupervisor?: string;
    } = {
      departmentalSupervisor: departmentalSupervisorId,
    };

    if (industrialSupervisorId) {
      payload.industrialSupervisor = industrialSupervisorId;
    }

    updateMutation.mutate(payload);
  };

  return {
    student,
    placement,
    isLoading: studentLoading || placementLoading,
    error,
    departmentalSupervisorId,
    setDepartmentalSupervisorId,
    industrialSupervisorId,
    setIndustrialSupervisorId,
    academicList,
    industrialList,
    academicSuggestions,
    industrialSuggestions,
    handleSave,
    isPending: updateMutation.isPending,
  };
}
