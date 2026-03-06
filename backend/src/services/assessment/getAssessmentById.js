const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getAssessmentById = async (assessmentId) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        student: { include: { user: true } },
        supervisor: { include: { user: true } },
      },
    });

    if (!assessment)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Assessment not found");
    return assessment;
  } catch (error) {
    logger.error(`Error getting assessment: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getAssessmentById };
