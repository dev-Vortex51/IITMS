import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";

export function useStudentDetails(studentId: string) {
  const { data: student, isLoading: isStudentLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => studentService.getStudentById(studentId),
    enabled: !!studentId,
  });

  const { data: placement, isLoading: isPlacementLoading } = useQuery({
    queryKey: ["placement", studentId],
    queryFn: () => studentService.getStudentPlacement(studentId),
    enabled: !!studentId,
  });

  const isLoading = isStudentLoading || isPlacementLoading;

  const placementStatus = () => {
    if (!placement)
      return { text: "No Placement", variant: "secondary" as const };
    const status = placement.status;
    if (status === "approved")
      return { text: "Approved", variant: "success" as const };
    if (status === "pending")
      return { text: "Pending", variant: "warning" as const };
    if (status === "rejected")
      return { text: "Rejected", variant: "destructive" as const };
    return { text: "Unknown", variant: "secondary" as const };
  };

  return {
    student,
    placement,
    isLoading,
    placementStatus: placementStatus(),
  };
}
