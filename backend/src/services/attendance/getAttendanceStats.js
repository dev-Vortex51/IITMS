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

    const [total, groupedByStatus, recentRecords] = await Promise.all([
      prisma.attendance.count({ where: { studentId } }),
      prisma.attendance.groupBy({
        by: ["dayStatus"],
        where: { studentId },
        _count: { _all: true },
      }),
      prisma.attendance.findMany({
        where: { studentId },
        select: { dayStatus: true, date: true },
        orderBy: { date: "desc" },
        take: 365,
      }),
    ]);

    const stats = {
      total,
      presentOnTime: 0,
      presentLate: 0,
      halfDay: 0,
      absent: 0,
      excusedAbsence: 0,
      incomplete: 0,
    };

    groupedByStatus.forEach((group) => {
      const count = group._count._all;
      switch (group.dayStatus) {
        case "PRESENT_ON_TIME":
          stats.presentOnTime = count;
          break;
        case "PRESENT_LATE":
          stats.presentLate = count;
          break;
        case "HALF_DAY":
          stats.halfDay = count;
          break;
        case "ABSENT":
          stats.absent = count;
          break;
        case "EXCUSED_ABSENCE":
          stats.excusedAbsence = count;
          break;
        case "INCOMPLETE":
          stats.incomplete = count;
          break;
      }
    });

    let currentStreak = 0;
    for (const record of recentRecords) {
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
