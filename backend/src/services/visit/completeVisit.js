const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { canManageVisit, visitInclude } = require("./helpers");

const prisma = getPrismaClient();

const completeVisit = async (id, payload, user) => {
  try {
    const existingVisit = await prisma.visit.findUnique({
      where: { id },
      include: {
        student: {
          select: { departmentId: true },
        },
      },
    });

    if (!existingVisit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Visit record not found");
    }

    if (!canManageVisit(existingVisit, user)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to complete this visit",
      );
    }

    const coordinatorDepartmentId = user.departmentId || user.department;
    if (
      user.role === "coordinator" &&
      coordinatorDepartmentId &&
      existingVisit.student?.departmentId !== coordinatorDepartmentId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have access to this department visit",
      );
    }

    const completedVisit = await prisma.visit.update({
      where: { id },
      data: {
        status: "completed",
        completedAt: new Date(),
        feedback:
          payload.feedback !== undefined
            ? payload.feedback || null
            : existingVisit.feedback,
        score: payload.score !== undefined ? payload.score : existingVisit.score,
      },
      include: visitInclude,
    });

    return completedVisit;
  } catch (error) {
    logger.error(`Error completing visit: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { completeVisit };
