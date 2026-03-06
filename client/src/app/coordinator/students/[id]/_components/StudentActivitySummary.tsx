import { DashboardMetricsGrid } from "@/components/design-system";

export function StudentActivitySummary({
  student,
  placement,
}: {
  student: any;
  placement: any;
}) {
  const supervisorsAssigned = [
    Boolean(student?.departmentalSupervisor),
    Boolean(student?.industrialSupervisor),
  ].filter(Boolean).length;

  const placementState = placement?.status
    ? placement.status.charAt(0).toUpperCase() + placement.status.slice(1)
    : "Not Submitted";

  const items = [
    {
      label: "Placement",
      value: placementState,
      hint: "Current placement workflow stage",
      trend: "neutral" as const,
    },
    {
      label: "Supervisors Assigned",
      value: `${supervisorsAssigned}/2`,
      hint: "Departmental and industrial",
      trend: supervisorsAssigned > 0 ? ("up" as const) : ("neutral" as const),
    },
    {
      label: "Level",
      value: student?.level || "N/A",
      hint: "Current academic level",
      trend: "neutral" as const,
    },
    {
      label: "Session",
      value: student?.session || "N/A",
      hint: "Active academic session",
      trend: "neutral" as const,
    },
  ];

  return <DashboardMetricsGrid items={items} />;
}
