/**
 * Attendance Service
 * API client for attendance tracking
 */

import { apiClient } from "@/lib/api-client";

export interface Location {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface CheckInData {
  location?: Location;
  notes?: string;
}

export type DayStatus =
  | "PRESENT_ON_TIME"
  | "PRESENT_LATE"
  | "HALF_DAY"
  | "ABSENT"
  | "EXCUSED_ABSENCE"
  | "INCOMPLETE";

export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_REVIEW";

export type Punctuality = "ON_TIME" | "LATE";

export interface Anomaly {
  type:
    | "FREQUENT_LATENESS"
    | "HIGH_ABSENCE_RATE"
    | "FREQUENT_INCOMPLETE_DAYS"
    | "CONSECUTIVE_ABSENCES";
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
}

export interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    matricNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  placement: {
    _id: string;
    companyName: string;
    position: string;
  };
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  hoursWorked?: number;
  location?: Location;
  notes?: string;
  punctuality?: Punctuality;
  dayStatus: DayStatus;
  approvalStatus: ApprovalStatus;
  absenceReason?: string;
  reviewedBy?: {
    _id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  reviewedAt?: string;
  supervisorComment?: string;
  isLateEntry?: boolean;
  isIncomplete?: boolean;
  // Backward compatibility
  status: "present" | "late" | "absent";
  acknowledgedBy?: {
    _id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  attendanceRate: number;
  currentStreak: number;
}

export interface AttendanceSummary {
  total: number;
  presentOnTime: number;
  presentLate: number;
  halfDay: number;
  absent: number;
  excusedAbsence: number;
  incomplete: number;
  pending: number;
  approved: number;
  rejected: number;
  needsReview: number;
  completionPercentage: number;
  punctualityRate: number;
  anomalies: Anomaly[];
}

export interface CheckOutData {
  location?: Location;
  notes?: string;
}

export interface AbsenceRequestData {
  date: string;
  reason: string;
}

export interface ApprovalData {
  comment?: string;
}

export interface ReclassifyData {
  dayStatus: DayStatus;
  comment: string;
}

export interface AttendanceFilters {
  startDate?: string;
  endDate?: string;
  status?: "present" | "late" | "absent";
}

class AttendanceService {
  /**
   * Student checks in for the day
   */
  async checkIn(data: CheckInData): Promise<AttendanceRecord> {
    const response = await apiClient.post("/attendance/check-in", data);
    return response.data.data;
  }

  /**
   * Get today's check-in status
   */
  async getTodayCheckIn(): Promise<AttendanceRecord | null> {
    const response = await apiClient.get("/attendance/today");
    return response.data.data;
  }

  /**
   * Get my attendance history
   */
  async getMyAttendance(
    filters?: AttendanceFilters
  ): Promise<AttendanceRecord[]> {
    const response = await apiClient.get("/attendance/my-attendance", {
      params: filters,
    });
    return response.data.data;
  }

  /**
   * Get my attendance statistics
   */
  async getMyStats(): Promise<AttendanceStats> {
    const response = await apiClient.get("/attendance/my-stats");
    return response.data.data;
  }

  /**
   * Get attendance history for a specific student (Coordinator/Supervisor)
   */
  async getStudentAttendance(
    studentId: string,
    filters?: AttendanceFilters
  ): Promise<AttendanceRecord[]> {
    const response = await apiClient.get(`/attendance/student/${studentId}`, {
      params: filters,
    });
    return response.data.data;
  }

  /**
   * Get attendance statistics for a specific student (Coordinator/Supervisor)
   */
  async getStudentStats(studentId: string): Promise<AttendanceStats> {
    const response = await apiClient.get(
      `/attendance/student/${studentId}/stats`
    );
    return response.data.data;
  }

  /**
   * Get attendance records for a placement (Supervisor)
   */
  async getPlacementAttendance(
    placementId: string,
    filters?: AttendanceFilters
  ): Promise<AttendanceRecord[]> {
    const response = await apiClient.get(
      `/attendance/placement/${placementId}`,
      {
        params: filters,
      }
    );
    return response.data.data;
  }

  /**
   * Supervisor acknowledges student attendance
   */
  async acknowledgeAttendance(attendanceId: string): Promise<AttendanceRecord> {
    const response = await apiClient.post(
      `/attendance/${attendanceId}/acknowledge`
    );
    return response.data.data;
  }

  /**
   * Student checks out for the day
   */
  async checkOut(data: CheckOutData): Promise<AttendanceRecord> {
    const response = await apiClient.put("/attendance/check-out", data);
    return response.data.data;
  }

  /**
   * Submit absence request
   */
  async submitAbsenceRequest(
    data: AbsenceRequestData
  ): Promise<AttendanceRecord> {
    const response = await apiClient.post("/attendance/absence-request", data);
    return response.data.data;
  }

  /**
   * Approve attendance/absence
   */
  async approveAttendance(
    attendanceId: string,
    data: ApprovalData
  ): Promise<AttendanceRecord> {
    const response = await apiClient.post(
      `/attendance/${attendanceId}/approve`,
      data
    );
    return response.data.data;
  }

  /**
   * Reject attendance/absence
   */
  async rejectAttendance(
    attendanceId: string,
    comment: string
  ): Promise<AttendanceRecord> {
    const response = await apiClient.post(
      `/attendance/${attendanceId}/reject`,
      { comment }
    );
    return response.data.data;
  }

  /**
   * Reclassify attendance day status
   */
  async reclassifyAttendance(
    attendanceId: string,
    data: ReclassifyData
  ): Promise<AttendanceRecord> {
    const response = await apiClient.patch(
      `/attendance/${attendanceId}/reclassify`,
      data
    );
    return response.data.data;
  }

  /**
   * Get attendance summary with anomaly detection
   */
  async getAttendanceSummary(studentId: string): Promise<AttendanceSummary> {
    const response = await apiClient.get(`/attendance/summary/${studentId}`);
    return response.data.data;
  }

  /**
   * Mark students as absent (Coordinator/Admin only)
   */
  async markAbsent(date?: string): Promise<AttendanceRecord[]> {
    const response = await apiClient.post("/attendance/mark-absent", {
      date,
    });
    return response.data.data;
  }
}

export const attendanceService = new AttendanceService();
