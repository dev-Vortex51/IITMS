import { StatRingCard } from "@/components/design-system";

export function InvitationMetrics({ stats }: { stats: any }) {
  const toProgress = (value: number) => {
    if (!stats?.total || stats.total <= 0) return 0;
    return Math.round((value / stats.total) * 100);
  };

  const cards = [
    {
      label: "Total",
      value: stats.total,
      progress: stats.total > 0 ? 100 : 0,
      color: "teal",
      trend: "up" as const,
    },
    {
      label: "Pending",
      value: stats.pending,
      progress: toProgress(stats.pending),
      color: "yellow",
      trend: "up" as const,
    },
    {
      label: "Accepted",
      value: stats.accepted,
      progress: toProgress(stats.accepted),
      color: "green",
      trend: "up" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
  );
}
