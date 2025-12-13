"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  attendanceService,
  type AttendanceFilters,
} from "@/services/attendance.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

export function AttendanceHistory() {
  const [filters, setFilters] = useState<AttendanceFilters>({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  // Get attendance history
  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance", "history", filters],
    queryFn: () => attendanceService.getMyAttendance(filters),
  });

  const handleMonthChange = (value: string) => {
    const date = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (value) {
      case "current":
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
        break;
      case "last":
        startDate = startOfMonth(subMonths(date, 1));
        endDate = endOfMonth(subMonths(date, 1));
        break;
      case "all":
        startDate = new Date(0);
        endDate = new Date();
        break;
      default:
        return;
    }

    setFilters({
      ...filters,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      present: "default",
      late: "secondary",
      absent: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getDayStatusBadge = (dayStatus: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive"; label: string }
    > = {
      PRESENT_ON_TIME: { variant: "default", label: "On Time" },
      PRESENT_LATE: { variant: "secondary", label: "Late" },
      HALF_DAY: { variant: "secondary", label: "Half Day" },
      ABSENT: { variant: "destructive", label: "Absent" },
      EXCUSED_ABSENCE: { variant: "default", label: "Excused" },
      INCOMPLETE: { variant: "secondary", label: "Incomplete" },
    };

    const config = statusConfig[dayStatus] || {
      variant: "default" as const,
      label: dayStatus,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance History
            </CardTitle>
            <CardDescription>
              View your check-in records and attendance pattern
            </CardDescription>
          </div>
          <Select onValueChange={handleMonthChange} defaultValue="current">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="last">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!attendance || attendance.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No attendance records found for this period</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Day Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {record.checkInTime
                            ? format(new Date(record.checkInTime), "h:mm a")
                            : "-"}
                        </div>
                        {record.punctuality && (
                          <Badge
                            variant={
                              record.punctuality === "ON_TIME"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {record.punctuality === "ON_TIME" ? "✓" : "⏰"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.checkOutTime ? (
                        <span className="text-sm">
                          {format(new Date(record.checkOutTime), "h:mm a")}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.hoursWorked !== undefined ? (
                        <span className="text-sm font-medium">
                          {record.hoursWorked.toFixed(1)}h
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getDayStatusBadge(record.dayStatus)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.approvalStatus === "APPROVED"
                            ? "default"
                            : record.approvalStatus === "REJECTED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {record.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        {record.notes && (
                          <p className="text-sm truncate">{record.notes}</p>
                        )}
                        {record.absenceReason && (
                          <p className="text-xs text-muted-foreground truncate">
                            Reason: {record.absenceReason}
                          </p>
                        )}
                        {record.supervisorComment && (
                          <p className="text-xs text-blue-600 truncate">
                            💬 {record.supervisorComment}
                          </p>
                        )}
                        {!record.notes &&
                          !record.absenceReason &&
                          !record.supervisorComment && (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
