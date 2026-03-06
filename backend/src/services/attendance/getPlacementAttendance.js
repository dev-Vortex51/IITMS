const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { USER_ROLES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const { getLagosDayBounds } = require("./helpers");

const prisma = getPrismaClient();

const getPlacementAttendance = async (placementId, filters = {}, user) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
    });

    if (!placement) {
      throw new ApiError(404, "Placement not found");
    }

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
        where.date.gte = getLagosDayBounds(new Date(filters.startDate)).startOfDay;
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

module.exports = { getPlacementAttendance };
