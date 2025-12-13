"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attendanceService,
  type AttendanceRecord,
} from "@/services/attendance.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// Replaced Alert with inline styled div to avoid missing component import
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export function AttendanceCheckIn() {
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  // Get today's check-in status
  const { data: todayCheckIn, isLoading: isLoadingToday } = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: () => attendanceService.getTodayCheckIn(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get attendance stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["attendance", "stats"],
    queryFn: () => attendanceService.getMyStats(),
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (data: { notes?: string; location?: any }) =>
      attendanceService.checkIn(data),
    onSuccess: () => {
      toast.success("Check-in successful!");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to check in");
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: (data: { notes?: string; location?: any }) =>
      attendanceService.checkOut(data),
    onSuccess: (data) => {
      toast.success(
        `Check-out successful! Hours worked: ${
          data.hoursWorked?.toFixed(1) || 0
        }hrs`
      );
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to check out");
    },
  });

  const handleCheckIn = async () => {
    // Get location if available
    let location = undefined;

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false,
            });
          }
        );

        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch (err) {
        console.log("Location permission denied or unavailable");
      }
    }

    checkInMutation.mutate({ notes: notes || undefined, location });
  };

  const handleCheckOut = async () => {
    // Get location if available
    let location = undefined;

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false,
            });
          }
        );

        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch (err) {
        console.log("Location permission denied or unavailable");
      }
    }

    checkOutMutation.mutate({ notes: notes || undefined, location });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      present: "default",
      late: "secondary",
      absent: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDayStatusBadge = (dayStatus: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive"; label: string }
    > = {
      PRESENT_ON_TIME: { variant: "default", label: "Present On Time" },
      PRESENT_LATE: { variant: "secondary", label: "Present Late" },
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

  const getPunctualityBadge = (punctuality?: string) => {
    if (!punctuality) return null;
    return (
      <Badge variant={punctuality === "ON_TIME" ? "default" : "secondary"}>
        {punctuality === "ON_TIME" ? "✓ On Time" : "⏰ Late"}
      </Badge>
    );
  };

  if (isLoadingToday || isLoadingStats) {
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

  const currentTime = new Date();
  const isLate = currentTime.getHours() >= 9;

  return (
    <div className="space-y-6">
      {/* Check-in Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Daily Check-In
              </CardTitle>
              <CardDescription>
                {format(currentTime, "EEEE, MMMM d, yyyy")}
              </CardDescription>
            </div>
            {todayCheckIn && (
              <div className="text-right">
                {getStatusBadge(todayCheckIn.status)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayCheckIn ? (
            // Already checked in
            <div className="space-y-4">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                {getPunctualityBadge(todayCheckIn.punctuality)}
                {getDayStatusBadge(todayCheckIn.dayStatus)}
              </div>

              {/* Check-in info */}
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>
                  You checked in{" "}
                  {formatDistanceToNow(new Date(todayCheckIn.checkInTime))} ago
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Check-in Time:</span>
                  <span>
                    {format(new Date(todayCheckIn.checkInTime), "h:mm a")}
                  </span>
                </div>

                {todayCheckIn.checkOutTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Check-out Time:</span>
                    <span>
                      {format(new Date(todayCheckIn.checkOutTime), "h:mm a")}
                    </span>
                  </div>
                )}

                {todayCheckIn.hoursWorked !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Hours Worked:</span>
                    <span className="font-bold text-green-600">
                      {todayCheckIn.hoursWorked.toFixed(1)} hrs
                    </span>
                  </div>
                )}

                {todayCheckIn.location?.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span className="truncate">
                      {todayCheckIn.location.address}
                    </span>
                  </div>
                )}
              </div>

              {todayCheckIn.notes && (
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <div className="text-sm p-3 bg-muted rounded-md">
                    {todayCheckIn.notes}
                  </div>
                </div>
              )}

              {/* Check-out button */}
              {!todayCheckIn.checkOutTime && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkoutNotes">
                      Check-out Notes (Optional)
                    </Label>
                    <Textarea
                      id="checkoutNotes"
                      placeholder="Add notes about today's work completion..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      maxLength={500}
                    />
                  </div>

                  <Button
                    onClick={handleCheckOut}
                    disabled={checkOutMutation.isPending}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    {checkOutMutation.isPending ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Checking out...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Check Out Now
                      </>
                    )}
                  </Button>
                </div>
              )}

              {todayCheckIn.checkOutTime && (
                <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    You have completed today's attendance. See you tomorrow!
                  </span>
                </div>
              )}

              {todayCheckIn.supervisorComment && (
                <div className="space-y-2">
                  <Label>Supervisor Comment</Label>
                  <div className="text-sm p-3 bg-muted rounded-md border-l-4 border-blue-500">
                    {todayCheckIn.supervisorComment}
                  </div>
                </div>
              )}

              {todayCheckIn.acknowledgedBy && (
                <div className="text-sm text-muted-foreground">
                  <CheckCircle2 className="inline h-4 w-4 mr-1" />
                  Acknowledged by {
                    todayCheckIn.acknowledgedBy.user.firstName
                  }{" "}
                  {todayCheckIn.acknowledgedBy.user.lastName}
                </div>
              )}
            </div>
          ) : (
            // Not checked in yet
            <div className="space-y-4">
              {isLate && (
                <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
                  <Clock className="h-4 w-4" />
                  <span>
                    Note: Check-ins after 8:15 AM are marked as LATE. Work
                    hours: 8:00 AM - 4:00 PM
                  </span>
                </div>
              )}
              {!isLate && (
                <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Great! Check-in before 8:15 AM to be marked ON TIME
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about today's work..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {notes.length}/500 characters
                </p>
              </div>

              <Button
                onClick={handleCheckIn}
                disabled={checkInMutation.isPending}
                className="w-full"
                size="lg"
              >
                {checkInMutation.isPending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Checking in...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Check In Now
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your location may be recorded for verification
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.present}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Late
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.late}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Rate */}
      {stats && stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Rate</span>
                <span className="font-bold">
                  {stats.attendanceRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.attendanceRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
