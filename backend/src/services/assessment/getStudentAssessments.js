const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ASSESSMENT_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getStudentAssessments = async (studentId) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { studentId },
      include: {
        supervisor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const summary = {
      total: assessments.length,
      pending: assessments.filter((a) => a.status === ASSESSMENT_STATUS.PENDING)
        .length,
      submitted: assessments.filter(
        (a) => a.status === ASSESSMENT_STATUS.SUBMITTED,
      ).length,
      completed: assessments.filter(
        (a) => a.status === ASSESSMENT_STATUS.COMPLETED,
      ).length,
      assessments,
    };

    return summary;
  } catch (error) {
    logger.error(`Error getting student assessments: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getStudentAssessments };
