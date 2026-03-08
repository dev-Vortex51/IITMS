const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const submitEvaluation = async (id, supervisorId) => {
  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      select: { id: true, supervisorId: true, status: true },
    });

    if (!evaluation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Evaluation not found");
    }

    if (evaluation.supervisorId !== supervisorId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only submit your own evaluations",
      );
    }

    if (evaluation.status === "completed") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Completed evaluation cannot be re-submitted",
      );
    }

    return prisma.evaluation.update({
      where: { id },
      data: {
        status: "submitted",
        submittedAt: new Date(),
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
    logger.error(`Error submitting evaluation: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { submitEvaluation };
