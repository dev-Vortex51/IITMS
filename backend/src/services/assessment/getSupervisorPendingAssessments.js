const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ASSESSMENT_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getSupervisorPendingAssessments = async (supervisorId) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        supervisorId,
        status: ASSESSMENT_STATUS.PENDING,
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    return assessments;
  } catch (error) {
    logger.error(
      `Error getting supervisor pending assessments: ${error.message}`,
    );
    throw handlePrismaError(error);
  }
};

module.exports = { getSupervisorPendingAssessments };
