const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { visitInclude } = require("./helpers");

const prisma = getPrismaClient();

const getVisitsByStudent = async (studentId) => {
  try {
    return await prisma.visit.findMany({
      where: { studentId },
      orderBy: { visitDate: "desc" },
      include: visitInclude,
    });
  } catch (error) {
    logger.error(`Error getting student visits: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getVisitsByStudent };
