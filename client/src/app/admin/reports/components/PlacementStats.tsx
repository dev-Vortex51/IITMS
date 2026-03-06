import { StatRingCard } from "@/components/design-system";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlacementStatsProps {
  approvedPlacements: number;
  pendingPlacements: number;
  rejectedPlacements: number;
}

export function PlacementStats({
  approvedPlacements,
  pendingPlacements,
  rejectedPlacements,
}: PlacementStatsProps) {
  const totalPlacements = approvedPlacements + pendingPlacements + rejectedPlacements;
  const toProgress = (value: number) => {
    if (totalPlacements <= 0) return 0;
    return Math.round((value / totalPlacements) * 100);
  };

  const cards = [
    {
      label: "Approved",
      value: approvedPlacements,
      progress: toProgress(approvedPlacements),
      color: "green",
      trend: "up" as const,
    },
    {
      label: "Pending",
      value: pendingPlacements,
      progress: toProgress(pendingPlacements),
      color: "yellow",
      trend: "up" as const,
    },
    {
      label: "Rejected",
      value: rejectedPlacements,
      progress: toProgress(rejectedPlacements),
      color: "red",
      trend: "down" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Placement Statistics</CardTitle>
        <CardDescription>Overview of student placements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <StatRingCard
              key={card.label}
              label={card.label}
              value={card.value}
              progress={card.progress}
              color={card.color}
              trend={card.trend}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
