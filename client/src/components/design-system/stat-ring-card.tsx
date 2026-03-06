import { Center, Group, Paper, RingProgress, Text } from "@mantine/core";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatRingCardProps {
  label: string;
  value: string | number;
  progress: number;
  color: string;
  trend?: "up" | "down";
  className?: string;
}

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
} as const;

export function StatRingCard({
  label,
  value,
  progress,
  color,
  trend = "up",
  className,
}: StatRingCardProps) {
  const Icon = trendIcons[trend];
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <Paper withBorder radius="md" p="md" className={cn("min-h-[132px] shadow-sm", className)}>
      <Group wrap="nowrap">
        <RingProgress
          size={88}
          roundCaps
          thickness={8}
          sections={[{ value: progress, color }]}
          label={
            <Center>
              <Icon size={20} strokeWidth={1.75} />
            </Center>
          }
        />

        <div>
          <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
            {label}
          </Text>
          <Text fw={700} size="xl">
            {displayValue}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}
