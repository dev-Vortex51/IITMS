"use client";

import { useQuery } from "@tanstack/react-query";
import {
  attendanceService,
  type AttendanceSummary,
  type Anomaly,
} from "@/services/attendance.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceSummaryProps {
  studentId: string;
}

export function AttendanceSummaryCard({ studentId }: AttendanceSummaryProps) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["attendance", "summary", studentId],
    queryFn: () => attendanceService.getAttendanceSummary(studentId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) return null;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "MEDIUM":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "border-red-200 bg-red-50 text-red-700";
      case "MEDIUM":
        return "border-orange-200 bg-orange-50 text-orange-700";
      default:
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Anomaly Alerts */}
      {summary.anomalies && summary.anomalies.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Attendance Alerts
            </CardTitle>
            <CardDescription>
              Issues detected that require attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.anomalies.map((anomaly: Anomaly, index: number) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 rounded-md border p-3 text-sm",
                  getSeverityColor(anomaly.severity)
                )}
              >
                {getSeverityIcon(anomaly.severity)}
                <div className="flex-1">
                  <p className="font-medium">{anomaly.description}</p>
                  <p className="text-xs mt-1 opacity-80">
                    Severity: {anomaly.severity}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Summary
          </CardTitle>
          <CardDescription>
            Comprehensive overview of attendance records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Completion and Punctuality */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Completion Rate</span>
                <span className="text-2xl font-bold text-green-600">
                  {summary.completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${summary.completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Days with complete attendance records
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Punctuality Rate</span>
                <span className="text-2xl font-bold text-blue-600">
                  {summary.punctualityRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${summary.punctualityRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                On-time check-ins (≤8:15 AM)
              </p>
            </div>
          </div>

          {/* Day Status Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Day Status Breakdown</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                label="Present On Time"
                value={summary.presentOnTime}
                variant="success"
              />
              <StatCard
                icon={<Clock className="h-4 w-4 text-orange-600" />}
                label="Present Late"
                value={summary.presentLate}
                variant="warning"
              />
              <StatCard
                icon={<Clock className="h-4 w-4 text-yellow-600" />}
                label="Half Day"
                value={summary.halfDay}
                variant="warning"
              />
              <StatCard
                icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
                label="Absent"
                value={summary.absent}
                variant="danger"
              />
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4 text-blue-600" />}
                label="Excused Absence"
                value={summary.excusedAbsence}
                variant="info"
              />
              <StatCard
                icon={<AlertCircle className="h-4 w-4 text-gray-600" />}
                label="Incomplete"
                value={summary.incomplete}
                variant="secondary"
              />
            </div>
          </div>

          {/* Approval Status */}
          <div>
            <h4 className="text-sm font-medium mb-3">Approval Status</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Clock className="h-4 w-4 text-yellow-600" />}
                label="Pending"
                value={summary.pending}
                variant="warning"
              />
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                label="Approved"
                value={summary.approved}
                variant="success"
              />
              <StatCard
                icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
                label="Rejected"
                value={summary.rejected}
                variant="danger"
              />
              <StatCard
                icon={<AlertCircle className="h-4 w-4 text-orange-600" />}
                label="Needs Review"
                value={summary.needsReview}
                variant="warning"
              />
            </div>
          </div>

          {/* Total Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Attendance Days</span>
              <span className="text-2xl font-bold">{summary.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant?: "success" | "warning" | "danger" | "info" | "secondary";
}

function StatCard({
  icon,
  label,
  value,
  variant = "secondary",
}: StatCardProps) {
  const variantClasses = {
    success: "border-green-200 bg-green-50",
    warning: "border-orange-200 bg-orange-50",
    danger: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50",
    secondary: "border-gray-200 bg-gray-50",
  };

  return (
    <div
      className={cn(
        "rounded-md border p-3 transition-colors",
        variantClasses[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className="text-lg font-bold">{value}</span>
      </div>
    </div>
  );
}
