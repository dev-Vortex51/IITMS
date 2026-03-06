const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { USER_ROLES } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getAttendanceStats = async (studentId, user) => {
  try {
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

module.exports = { getAttendanceStats };
