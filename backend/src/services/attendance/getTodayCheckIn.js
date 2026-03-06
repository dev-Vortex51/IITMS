const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { getLagosDayBounds } = require("./helpers");

const prisma = getPrismaClient();

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

module.exports = { getTodayCheckIn };
