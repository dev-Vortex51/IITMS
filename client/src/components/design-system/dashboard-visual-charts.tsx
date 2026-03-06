import { useMemo } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

type ChartDatum = Record<string, any>;

type DashboardTrendLineChartProps = {
  data: ChartDatum[];
  xKey: string;
  yKey: string;
  stroke?: string;
  comparisonStroke?: string;
};

type DashboardDonutChartProps = {
  data: ChartDatum[];
  nameKey: string;
  valueKey: string;
  colors?: string[];
};

function formatPercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function DonutTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const name = item.name || "Segment";
  const value = Number(item.value || 0);
  const total = Number(payload.reduce((sum, entry) => sum + Number(entry.value || 0), 0));
  const percent = formatPercent(value, total);

  return (
    <div className="rounded-lg bg-[#30305a] px-4 py-3 text-white shadow-lg">
      <p className="text-sm font-semibold">{name}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-white/75">{percent}% of total</p>
    </div>
  );
}

export function DashboardTrendLineChart({
  data,
  xKey,
  yKey,
  stroke = "hsl(var(--primary))",
  comparisonStroke = "hsl(var(--border))",
}: DashboardTrendLineChartProps) {
  const normalizedData = useMemo(() => {
    return data.map((item, index) => {
      const value = Number(item[yKey] || 0);
      const prevValue = index > 0 ? Number(data[index - 1]?.[yKey] || 0) : value;
      const comparison = Math.max(
        0,
        Math.round((value + prevValue) / 2 + (index % 2 === 0 ? 1 : -1) * Math.max(1, value * 0.08)),
      );

      return {
        ...item,
        __value: value,
        __comparison: comparison,
      };
    });
  }, [data, yKey]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={normalizedData} margin={{ top: 8, right: 6, left: 2, bottom: 8 }}>
        <XAxis dataKey={xKey} hide />
        <YAxis hide />
        <CartesianGrid
          vertical={false}
          horizontal
          stroke="hsl(var(--border))"
          strokeDasharray="2 6"
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            borderColor: "hsl(var(--border))",
            background: "hsl(var(--card))",
            fontSize: 12,
          }}
          labelStyle={{ color: "hsl(var(--muted-foreground))" }}
          formatter={(value) => [value, "Value"]}
          labelFormatter={(label) => String(label)}
        />
        <Line
          type="monotone"
          dataKey="__comparison"
          stroke={comparisonStroke}
          strokeWidth={2.5}
          dot={false}
          activeDot={false}
          isAnimationActive
          animationDuration={500}
        />
        <Line
          type="monotone"
          dataKey="__value"
          stroke={stroke}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 4, fill: stroke, strokeWidth: 0 }}
          isAnimationActive
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DashboardDonutChart({
  data,
  nameKey,
  valueKey,
  colors = ["#4f62c7", "#7486e2", "#c4cbf7"],
}: DashboardDonutChartProps) {
  const normalizedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      __name: item[nameKey],
      __value: Number(item[valueKey] || 0),
      __color: item.color || colors[index % colors.length],
    }));
  }, [colors, data, nameKey, valueKey]);

  const total = normalizedData.reduce((sum, item) => sum + item.__value, 0);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="h-[190px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={normalizedData}
              dataKey="__value"
              nameKey="__name"
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={72}
              paddingAngle={0}
              stroke="none"
              animationDuration={750}
            >
              {normalizedData.map((item, index) => (
                <Cell key={`${item.__name}-${index}`} fill={item.__color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
        {normalizedData.map((item) => (
          <div key={item.__name} className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.__color }} />
              <span className="truncate">{item.__name}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {formatPercent(item.__value, total)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
