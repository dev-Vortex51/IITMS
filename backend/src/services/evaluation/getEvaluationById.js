const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getEvaluationById = async (id, user) => {
  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        supervisor: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!evaluation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Evaluation not found");
    }

    if (
      user.role === USER_ROLES.ACADEMIC_SUPERVISOR &&
      evaluation.supervisorId !== user.supervisorProfile
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have access to this evaluation",
      );
    }

    return evaluation;
  } catch (error) {
    logger.error(`Error getting evaluation by id: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { getEvaluationById };
