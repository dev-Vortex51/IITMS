"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { EmptyState, SectionCard } from "@/components/design-system";
import { useState } from "react";

interface DashboardChartsProps {
  departmentsData: any[];
  placementsData: any[];
}

// 1. Pro-Tier Tooltip (Shadcn/Tremor Style)
const ModernTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[160px] rounded-lg border border-border bg-popover p-3 shadow-lg outline-none">
        <div className="mb-2 border-b border-border/50 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label || payload[0].payload.name}
        </div>
        <div className="grid gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full ring-2 ring-background"
                  style={{ backgroundColor: entry.color || entry.payload.fill }}
                />
                <span className="text-sm font-medium text-popover-foreground">
                  {entry.name || "Value"}
                </span>
              </div>
              <span className="text-sm font-semibold text-popover-foreground tabular-nums">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// 2. Custom Active Shape for Donut Chart (Hover Effect)
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={8}
      />
    </g>
  );
};

export function DashboardCharts({
  departmentsData,
  placementsData,
}: DashboardChartsProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-2">
      
      {/* --- PREMIUM BAR CHART --- */}
      <SectionCard title="Students by Department">
        {departmentsData?.length > 0 ? (
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
             <BarChart
  data={departmentsData}
  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
  barSize={32}
>
  <CartesianGrid
    vertical={false}
    stroke="hsl(var(--border))"
    opacity={0.4}
  />
  
  <XAxis
    dataKey="name"
    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
    tickLine={false}
    axisLine={false}
    dy={12}
  />
  <YAxis
    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
    tickLine={false}
    axisLine={false}
    dx={-12}
  />
  
  <Tooltip 
    content={<ModernTooltip />} 
    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
  />

  <Bar 
    // ⚠️ CRITICAL: Ensure "value" matches the number property in your data!
    // If your data uses "students" or "total", change this dataKey to match.
    dataKey="value" 
    name="Students" 
    // ✅ FIX: Use Tailwind classes instead of the fill prop for CSS variables
    className="fill-primary"
    radius={[4, 4, 0, 0]}
    animationDuration={1000}
  />
</BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="No department data"
            description="No department metrics available yet."
          />
        )}
      </SectionCard>

      {/* --- PREMIUM DONUT CHART --- */}
      <SectionCard title="Placement Status">
        {placementsData?.some((d) => d.value > 0) ? (
          <div className="h-[300px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  data={placementsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                  animationDuration={1000}
                >
                  {placementsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || `hsl(var(--primary))` } 
                      className="transition-all duration-300 outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<ModernTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Minimalist Center Metric */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-foreground tracking-tight">
                {placementsData.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                Total
              </span>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No placement data"
            description="Placement status metrics will appear here."
          />
        )}
      </SectionCard>
    </div>
  );
}
