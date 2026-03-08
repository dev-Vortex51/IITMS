const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const completeEvaluation = async (id, user) => {
  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      select: { id: true, supervisorId: true, status: true },
    });

    if (!evaluation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Evaluation not found");
    }

    const canCompleteAsOwner =
      user.role === USER_ROLES.ACADEMIC_SUPERVISOR &&
      evaluation.supervisorId === user.supervisorProfile;
    const canCompleteAsAdmin = [USER_ROLES.ADMIN, USER_ROLES.COORDINATOR].includes(
      user.role,
    );

    if (!canCompleteAsOwner && !canCompleteAsAdmin) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to complete this evaluation",
      );
    }

    return prisma.evaluation.update({
      where: { id },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });
  } catch (error) {
    logger.error(`Error completing evaluation: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { completeEvaluation };
