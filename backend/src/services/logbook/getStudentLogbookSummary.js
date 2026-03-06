const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { LOGBOOK_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getStudentLogbookSummary = async (studentId) => {
  try {
    const [
      totalLogbooks,
      submittedLogbooks,
      approvedLogbooks,
      rejectedLogbooks,
      logbookList,
    ] = await Promise.all([
      prisma.logbook.count({ where: { studentId } }),
      prisma.logbook.count({
        where: {
          studentId,
          status: {
            in: [
              LOGBOOK_STATUS.SUBMITTED,
              LOGBOOK_STATUS.REVIEWED,
              LOGBOOK_STATUS.APPROVED,
            ],
          },
        },
      }),
      prisma.logbook.count({
        where: { studentId, status: LOGBOOK_STATUS.APPROVED },
      }),
      prisma.logbook.count({
        where: { studentId, status: LOGBOOK_STATUS.REJECTED },
      }),
      prisma.logbook.findMany({
        where: { studentId },
        orderBy: { weekNumber: "asc" },
        include: {
          evidence: true,
          reviews: true,
        },
      }),
    ]);

    return {
      total: totalLogbooks,
      submitted: submittedLogbooks,
      approved: approvedLogbooks,
      rejected: rejectedLogbooks,
      logbooks: logbookList,
    };
  } catch (error) {
    logger.error(`Error getting logbook summary: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getStudentLogbookSummary };
