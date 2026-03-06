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
    if (!placement) return { text: "No Placement" };
    const status = placement.status;
    if (status === "approved") return { text: "Approved" };
    if (status === "pending") return { text: "Pending" };
    if (status === "rejected") return { text: "Rejected" };
    if (status === "withdrawn") return { text: "Withdrawn" };
    return { text: "Unknown" };
  };

  return {
    student,
    placement,
    isLoading,
    placementStatus: placementStatus(),
  };
}
