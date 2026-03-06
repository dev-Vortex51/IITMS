const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { USER_ROLES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const { getLagosDayBounds } = require("./helpers");

const prisma = getPrismaClient();

const getAttendanceHistory = async (studentId, filters = {}, user) => {
  try {
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

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = getLagosDayBounds(new Date(filters.startDate)).startOfDay;
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

module.exports = { getAttendanceHistory };
