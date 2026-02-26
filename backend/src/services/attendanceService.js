const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const { USER_ROLES } = require("../utils/constants");
const logger = require("../utils/logger");

const { getDistance } = require("geolib");
const { toZonedTime } = require("date-fns-tz");

const prisma = getPrismaClient();

// ==========================================
// TIMEZONE HELPERS
// ==========================================
const TIMEZONE = "Africa/Lagos";

const getLagosDayBounds = (date = new Date()) => {
  const lagosTime = toZonedTime(date, TIMEZONE);
  const year = lagosTime.getFullYear();
  const month = (lagosTime.getMonth() + 1).toString().padStart(2, "0");
  const day = lagosTime.getDate().toString().padStart(2, "0");

  // Construct UTC dates representing exactly 00:00:00 and 23:59:59 WAT
  const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000+01:00`);
  const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999+01:00`);

  return { startOfDay, endOfDay, lagosTime };
};

// ==========================================
// CONTROLLER FUNCTIONS
// ==========================================

/**
 * Check in student
 */
const checkIn = async (studentId, data = {}) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        placement: {
          where: { status: "approved" },
          take: 1,
        },
        user: true,
      },
    });

    if (!student) throw new ApiError(404, "Student not found");

    if (!student.placementApproved || student.placement.length === 0) {
      throw new ApiError(
        400,
        "You must have an approved placement to check in",
      );
    }

    const placement = student.placement[0];
    const { startOfDay, endOfDay, lagosTime } = getLagosDayBounds();

    // 1. Check if already checked in today (Timezone safe)
    const existingCheckin = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existingCheckin && existingCheckin.checkInTime) {
      throw new ApiError(400, "You have already checked in today");
    }

    // 2. Geofencing Validation (Only if placement has coordinates configured)
    let distanceFromOffice = null;
    if (placement.companyLat && placement.companyLng) {
      if (!data.location?.latitude || !data.location?.longitude) {
        throw new ApiError(400, "GPS location is required for check-in.");
      }

      distanceFromOffice = getDistance(
        {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        },
        { latitude: placement.companyLat, longitude: placement.companyLng },
      );

      const allowedRadius = placement.allowedRadius || 200; // Default 200 meters
      if (distanceFromOffice > allowedRadius) {
        throw new ApiError(
          403,
          `You are outside the acceptable radius. Distance: ${distanceFromOffice}m.`,
        );
      }
    }

    // 3. Dynamic Punctuality Logic
    let punctuality = "ON_TIME";
    const workStartTime = placement.workStartTime || "08:00";
    const [targetHour, targetMinute] = workStartTime.split(":").map(Number);

    const currentHour = lagosTime.getHours();
    const currentMinute = lagosTime.getMinutes();

    if (
      currentHour > targetHour ||
      (currentHour === targetHour && currentMinute > targetMinute)
    ) {
      punctuality = "LATE";
    }

    // 4. Create Record
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        placementId: placement.id,
        date: startOfDay, // Store standardized start of day
        checkInTime: new Date(), // Exact UTC time of action
        locationAddress: data.location?.address || null,
        locationLatitude: data.location?.latitude,
        locationLongitude: data.location?.longitude,
        distanceFromOffice, // Record the distance
        notes: data.notes || "",
        dayStatus: "INCOMPLETE",
        approvalStatus: "PENDING",
        punctuality,
        status: "present",
      },
      include: {
        student: { include: { user: true } },
        placement: true,
      },
    });

    return attendance;
  } catch (error) {
    logger.error(`Error checking in: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Check out student
 */
const checkOut = async (studentId, data = {}) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) throw new ApiError(404, "Student not found");

    const { startOfDay, endOfDay } = getLagosDayBounds();

    const attendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (!attendance)
      throw new ApiError(400, "You must check in before checking out");
    if (attendance.checkOutTime)
      throw new ApiError(400, "You have already checked out today");

    const now = new Date();
    if (now <= attendance.checkInTime) {
      throw new ApiError(400, "Check-out time must be after check-in time");
    }

    // Calculate hours worked safely
    const hoursWorked =
      (now.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);

    // Determine day status
    let dayStatus = "PRESENT_ON_TIME";
    if (attendance.punctuality === "LATE") {
      dayStatus = "PRESENT_LATE";
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: now,
        hoursWorked: parseFloat(hoursWorked.toFixed(2)),
        dayStatus,
        notes: data.notes
          ? (attendance.notes || "") +
            (attendance.notes ? "\n" : "") +
            data.notes
          : attendance.notes,
      },
      include: {
        student: { include: { user: true } },
        placement: true,
      },
    });

    return updated;
  } catch (error) {
    logger.error(`Error checking out: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get today's check in
 */
const getTodayCheckIn = async (studentId) => {
  try {
    const { startOfDay, endOfDay } = getLagosDayBounds();

    const attendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        student: { include: { user: true } },
        placement: true,
      },
    });

    return attendance;
  } catch (error) {
    logger.error(`Error getting today check in: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get attendance history
 */
const getAttendanceHistory = async (studentId, filters = {}, user) => {
  try {
    // Access permission logic remains unchanged
    if (user.role === USER_ROLES.STUDENT) {
      const requestingStudent = await prisma.student.findFirst({
        where: { userId: user.id },
      });
      if (!requestingStudent || requestingStudent.id !== studentId) {
        throw new ApiError(403, "You can only view your own attendance");
      }
    }

    if (user.role === USER_ROLES.COORDINATOR && user.departmentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });
      if (!student || student.departmentId !== user.departmentId) {
        throw new ApiError(
          403,
          "You can only view students in your department",
        );
      }
    }

    const where = { studentId };

    // Use proper boundary calculation for filters
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = getLagosDayBounds(
          new Date(filters.startDate),
        ).startOfDay;
      }
      if (filters.endDate) {
        where.date.lte = getLagosDayBounds(new Date(filters.endDate)).endOfDay;
      }
    }

    if (filters.dayStatus) where.dayStatus = filters.dayStatus;

    return await prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: true } },
        placement: true,
        supervisor: { include: { user: true } },
      },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    logger.error(`Error getting attendance history: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get attendance statistics
 */
const getAttendanceStats = async (studentId, user) => {
  try {
    // Verify access permissions
    if (user.role === USER_ROLES.STUDENT) {
      const requestingStudent = await prisma.student.findFirst({
        where: { userId: user.id },
      });

      if (!requestingStudent || requestingStudent.id !== studentId) {
        throw new ApiError(403, "You can only view your own statistics");
      }
    }

    if (user.role === USER_ROLES.COORDINATOR && user.departmentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student || student.departmentId !== user.departmentId) {
        throw new ApiError(
          403,
          "You can only view students in your department",
        );
      }
    }

    const records = await prisma.attendance.findMany({
      where: { studentId },
    });

    const stats = {
      total: records.length,
      presentOnTime: 0,
      presentLate: 0,
      halfDay: 0,
      absent: 0,
      excusedAbsence: 0,
      incomplete: 0,
    };

    records.forEach((record) => {
      switch (record.dayStatus) {
        case "PRESENT_ON_TIME":
          stats.presentOnTime++;
          break;
        case "PRESENT_LATE":
          stats.presentLate++;
          break;
        case "HALF_DAY":
          stats.halfDay++;
          break;
        case "ABSENT":
          stats.absent++;
          break;
        case "EXCUSED_ABSENCE":
          stats.excusedAbsence++;
          break;
        case "INCOMPLETE":
          stats.incomplete++;
          break;
      }
    });

    // Current streak calculation
    let currentStreak = 0;
    const sortedRecords = records.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    for (const record of sortedRecords) {
      if (
        record.dayStatus === "PRESENT_ON_TIME" ||
        record.dayStatus === "PRESENT_LATE"
      ) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { ...stats, currentStreak };
  } catch (error) {
    logger.error(`Error getting attendance stats: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get placement attendance
 */
const getPlacementAttendance = async (placementId, filters = {}, user) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
    });

    if (!placement) {
      throw new ApiError(404, "Placement not found");
    }

    // For supervisors, verify they are assigned to this placement
    if (
      user.role === USER_ROLES.ACADEMIC_SUPERVISOR ||
      user.role === USER_ROLES.INDUSTRIAL_SUPERVISOR
    ) {
      const supervisor = await prisma.supervisor.findFirst({
        where: { userId: user.id },
        include: {
          assignedStudents: { select: { studentId: true } },
        },
      });

      if (!supervisor) {
        throw new ApiError(403, "Access denied");
      }

      const isAssigned = supervisor.assignedStudents.some(
        (s) => s.studentId === placement.studentId,
      );

      if (!isAssigned) {
        throw new ApiError(
          403,
          "You can only view attendance for your assigned students",
        );
      }
    }

    const where = { placementId };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = getLagosDayBounds(
          new Date(filters.startDate),
        ).startOfDay;
      }
      if (filters.endDate) {
        where.date.lte = getLagosDayBounds(new Date(filters.endDate)).endOfDay;
      }
    }

    if (filters.dayStatus) {
      where.dayStatus = filters.dayStatus;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: true } },
        placement: true,
      },
      orderBy: { date: "desc" },
    });

    return attendance;
  } catch (error) {
    logger.error(`Error getting placement attendance: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Submit absence request
 */
const submitAbsenceRequest = async (studentId, date, reason) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { placement: { where: { status: "approved" }, take: 1 } },
    });

    if (
      !student ||
      !student.placementApproved ||
      student.placement.length === 0
    ) {
      throw new ApiError(
        400,
        "You must have an approved placement to submit absence requests",
      );
    }

    // Timezone safe boundaries
    const { startOfDay, endOfDay } = getLagosDayBounds(new Date(date));

    let attendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (attendance && attendance.approvalStatus === "APPROVED") {
      throw new ApiError(
        400,
        "Cannot request absence for already approved attendance",
      );
    }

    if (attendance && attendance.checkInTime) {
      throw new ApiError(
        400,
        "Cannot request absence for a day you already checked in",
      );
    }

    if (attendance) {
      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          absenceReason: reason,
          dayStatus: "ABSENT",
          approvalStatus: "PENDING",
          punctuality: "LATE",
        },
        include: { student: { include: { user: true } }, placement: true },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          studentId,
          placementId: student.placement[0].id,
          date: startOfDay,
          absenceReason: reason,
          dayStatus: "ABSENT",
          approvalStatus: "PENDING",
          punctuality: "LATE",
          status: "absent",
        },
        include: { student: { include: { user: true } }, placement: true },
      });
    }

    return attendance;
  } catch (error) {
    logger.error(`Error submitting absence request: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Approve attendance
 */
const approveAttendance = async (attendanceId, supervisorId, comment = "") => {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { placement: true, student: true },
    });

    if (!attendance) {
      throw new ApiError(404, "Attendance record not found");
    }

    // Verify supervisor is assigned
    const supervisor = await prisma.supervisor.findFirst({
      where: { userId: supervisorId },
      include: { assignedStudents: { select: { studentId: true } } },
    });

    if (!supervisor) {
      throw new ApiError(403, "Supervisor not found");
    }

    const isAssigned = supervisor.assignedStudents.some(
      (s) => s.studentId === attendance.student.id,
    );

    if (!isAssigned) {
      throw new ApiError(403, "You are not assigned to this student");
    }

    let dayStatus = attendance.dayStatus;
    if (dayStatus === "ABSENT" && attendance.absenceReason) {
      dayStatus = "EXCUSED_ABSENCE";
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        approvalStatus: "APPROVED",
        supervisorId: supervisor.id,
        supervisorApprovedAt: new Date(),
        supervisorComment: comment || attendance.supervisorComment,
        dayStatus,
      },
      include: {
        student: { include: { user: true } },
        placement: true,
        supervisor: { include: { user: true } },
      },
    });

    return updated;
  } catch (error) {
    logger.error(`Error approving attendance: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Reject attendance
 */
const rejectAttendance = async (attendanceId, supervisorId, comment) => {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { student: true },
    });

    if (!attendance) {
      throw new ApiError(404, "Attendance record not found");
    }

    const supervisor = await prisma.supervisor.findFirst({
      where: { userId: supervisorId },
      include: { assignedStudents: { select: { studentId: true } } },
    });

    if (!supervisor) {
      throw new ApiError(403, "Supervisor not found");
    }

    const isAssigned = supervisor.assignedStudents.some(
      (s) => s.studentId === attendance.student.id,
    );

    if (!isAssigned) {
      throw new ApiError(403, "You are not assigned to this student");
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        approvalStatus: "REJECTED",
        supervisorId: supervisor.id,
        supervisorApprovedAt: new Date(),
        supervisorComment: comment || "Request rejected",
      },
      include: {
        student: { include: { user: true } },
        placement: true,
        supervisor: { include: { user: true } },
      },
    });

    return updated;
  } catch (error) {
    logger.error(`Error rejecting attendance: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Mark absent for students who didn't check in
 * (Usually run by a CRON job at 11:59 PM)
 */
const markAbsent = async (targetDate = null) => {
  try {
    let dateInput = targetDate ? new Date(targetDate) : new Date();
    if (!targetDate) {
      dateInput.setDate(dateInput.getDate() - 1);
    }

    const { startOfDay, endOfDay } = getLagosDayBounds(dateInput);

    const activeStudents = await prisma.student.findMany({
      where: { placementApproved: true, hasPlacement: true },
      include: { placement: { where: { status: "approved" }, take: 1 } },
    });

    if (activeStudents.length === 0) return [];

    const studentIds = activeStudents.map((s) => s.id);

    const existingRecords = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: { gte: startOfDay, lte: endOfDay },
      },
      select: { studentId: true },
    });

    const studentsWithRecords = new Set(
      existingRecords.map((r) => r.studentId),
    );

    const absentData = [];
    for (const student of activeStudents) {
      if (
        !studentsWithRecords.has(student.id) &&
        student.placement.length > 0
      ) {
        absentData.push({
          studentId: student.id,
          placementId: student.placement[0].id,
          date: startOfDay,
          dayStatus: "ABSENT",
          approvalStatus: "PENDING",
          status: "absent",
        });
      }
    }

    if (absentData.length === 0) return [];

    const result = await prisma.attendance.createMany({ data: absentData });
    logger.info(
      `Created ${result.count} absent records for ${startOfDay.toISOString()}`,
    );

    return absentData;
  } catch (error) {
    logger.error(`Error marking absent: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get attendance summary
 */
const getAttendanceSummary = async (studentId, user) => {
  try {
    // Verify access
    if (user.role === USER_ROLES.STUDENT) {
      const requestingStudent = await prisma.student.findFirst({
        where: { userId: user.id },
      });

      if (!requestingStudent || requestingStudent.id !== studentId) {
        throw new ApiError(403, "You can only view your own summary");
      }
    }

    if (user.role === USER_ROLES.COORDINATOR && user.departmentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student || student.departmentId !== user.departmentId) {
        throw new ApiError(
          403,
          "You can only view students in your department",
        );
      }
    }

    const allRecords = await prisma.attendance.findMany({
      where: { studentId },
    });

    const summary = {
      total: allRecords.length,
      presentOnTime: 0,
      presentLate: 0,
      halfDay: 0,
      absent: 0,
      excusedAbsence: 0,
      incomplete: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completionPercentage: 0,
      punctualityRate: 0,
      anomalies: [],
    };

    allRecords.forEach((record) => {
      switch (record.dayStatus) {
        case "PRESENT_ON_TIME":
          summary.presentOnTime++;
          break;
        case "PRESENT_LATE":
          summary.presentLate++;
          break;
        case "HALF_DAY":
          summary.halfDay++;
          break;
        case "ABSENT":
          summary.absent++;
          break;
        case "EXCUSED_ABSENCE":
          summary.excusedAbsence++;
          break;
        case "INCOMPLETE":
          summary.incomplete++;
          break;
      }

      switch (record.approvalStatus) {
        case "PENDING":
          summary.pending++;
          break;
        case "APPROVED":
          summary.approved++;
          break;
        case "REJECTED":
          summary.rejected++;
          break;
      }
    });

    const completedDays =
      summary.presentOnTime +
      summary.presentLate +
      summary.halfDay +
      summary.excusedAbsence;
    summary.completionPercentage =
      summary.total > 0 ? Math.round((completedDays / summary.total) * 100) : 0;

    const presentDays = summary.presentOnTime + summary.presentLate;
    summary.punctualityRate =
      presentDays > 0
        ? Math.round((summary.presentOnTime / presentDays) * 100)
        : 0;

    // Detect anomalies
    if (presentDays > 5 && summary.presentLate / presentDays > 0.3) {
      summary.anomalies.push({
        type: "FREQUENT_LATENESS",
        severity: "MEDIUM",
        description: `${Math.round(
          (summary.presentLate / presentDays) * 100,
        )}% late arrivals`,
      });
    }

    if (summary.total > 5 && summary.absent / summary.total > 0.2) {
      summary.anomalies.push({
        type: "HIGH_ABSENCE_RATE",
        severity: "HIGH",
        description: `${Math.round(
          (summary.absent / summary.total) * 100,
        )}% absence rate`,
      });
    }

    return summary;
  } catch (error) {
    logger.error(`Error getting attendance summary: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayCheckIn,
  getAttendanceHistory,
  getAttendanceStats,
  getPlacementAttendance,
  submitAbsenceRequest,
  approveAttendance,
  rejectAttendance,
  markAbsent,
  getAttendanceSummary,
};
