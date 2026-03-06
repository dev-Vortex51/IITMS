const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { USER_ROLES } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getAttendanceSummary = async (studentId, user) => {
  try {
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

module.exports = { getAttendanceSummary };
