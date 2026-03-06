"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  PieChart as PieChartIcon,
  Timer,
} from "lucide-react";
import {
  Area,
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
} from "recharts";
import {
  attendanceService,
  type Anomaly,
  type AttendanceSummary,
} from "@/services/attendance.service";
import { StatCard } from "@/components/design-system/stat-card";
import { DashboardChartCard } from "@/components/design-system/dashboard-chart-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AttendanceSummaryProps {
  studentId: string;
}

const toNumber = (value: unknown) => Number(value ?? 0);

const getSeverityTone = (severity: string) => {
  const map: Record<string, string> = {
    HIGH: "border-rose-200 bg-rose-50 text-rose-800",
    MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
    LOW: "border-blue-200 bg-blue-50 text-blue-800",
  };
  return map[severity] || "border-slate-200 bg-slate-50 text-slate-700";
};

export function AttendanceSummaryCard({ studentId }: AttendanceSummaryProps) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["attendance", "summary", studentId],
    queryFn: () => attendanceService.getAttendanceSummary(studentId),
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-16 rounded bg-muted" />
            <div className="h-48 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const completionPercentage = toNumber(summary.completionPercentage);
  const punctualityRate = toNumber(summary.punctualityRate);

  const dayStatusData = [
    { label: "On Time", value: toNumber(summary.presentOnTime), color: "hsl(142 72% 29%)" },
    { label: "Late", value: toNumber(summary.presentLate), color: "hsl(38 92% 50%)" },
    { label: "Half Day", value: toNumber(summary.halfDay), color: "hsl(31 100% 50%)" },
    { label: "Absent", value: toNumber(summary.absent), color: "hsl(346 84% 61%)" },
    { label: "Excused", value: toNumber(summary.excusedAbsence), color: "hsl(221 83% 53%)" },
    { label: "Incomplete", value: toNumber(summary.incomplete), color: "hsl(215 14% 56%)" },
  ];

  const approvalData = [
    { label: "Approved", value: toNumber(summary.approved), color: "hsl(142 72% 29%)" },
    { label: "Pending", value: toNumber(summary.pending), color: "hsl(38 92% 50%)" },
    { label: "Needs Review", value: toNumber(summary.needsReview), color: "hsl(31 100% 50%)" },
    { label: "Rejected", value: toNumber(summary.rejected), color: "hsl(346 84% 61%)" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Days"
          value={toNumber(summary.total)}
          hint="Attendance timeline records"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          label="Completion Rate"
          value={`${completionPercentage.toFixed(1)}%`}
          hint="Days with complete in/out records"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label="Punctuality"
          value={`${punctualityRate.toFixed(1)}%`}
          hint="On-time check-in performance"
          icon={<Timer className="h-4 w-4" />}
        />
        <StatCard
          label="Open Reviews"
          value={toNumber(summary.pending) + toNumber(summary.needsReview)}
          hint="Pending + needs review"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {summary.anomalies?.length ? (
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <CardTitle className="text-base">Attendance Insights</CardTitle>
            <CardDescription>System-detected patterns requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {summary.anomalies.map((anomaly: Anomaly, index: number) => (
              <div
                key={`${anomaly.type}-${index}`}
                className={cn("flex items-start gap-2 rounded-md border px-3 py-2 text-sm", getSeverityTone(anomaly.severity))}
              >
                {anomaly.severity === "HIGH" ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                )}
                <div>
                  <p className="font-medium">{anomaly.description}</p>
                  <p className="text-xs opacity-90">Severity: {anomaly.severity}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardChartCard
          title="Day Status Distribution"
          badge="Attendance classification"
          className="[&>div:last-child]:h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dayStatusData} margin={{ top: 8, right: 12, left: -16, bottom: 6 }}>
              <defs>
                <linearGradient id="attendanceLineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  borderColor: "hsl(var(--border))",
                  background: "hsl(var(--background))",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#attendanceLineFill)"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "hsl(var(--background))",
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </DashboardChartCard>

        <DashboardChartCard
          title="Approval Flow"
          badge="Supervisor review outcomes"
          rightAddon={<PieChartIcon className="h-4 w-4 text-muted-foreground" />}
          controls={
            <div className="flex flex-wrap items-center gap-2">
              {approvalData.map((entry) => (
                <span
                  key={entry.label}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.label}: {entry.value}
                </span>
              ))}
            </div>
          }
          className="[&>div:last-child]:h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={approvalData}
                cx="50%"
                cy="48%"
                innerRadius={56}
                outerRadius={86}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {approvalData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </DashboardChartCard>
      </div>
    </div>
  );
}
