const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { canManageVisit, visitInclude } = require("./helpers");

const prisma = getPrismaClient();

const cancelVisit = async (id, payload, user) => {
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
        "You do not have permission to cancel this visit",
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

    if (existingVisit.status === "completed") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Completed visits cannot be cancelled",
      );
    }

    const cancelNote = payload?.feedback || payload?.reason || null;

    const cancelledVisit = await prisma.visit.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        feedback: cancelNote ?? existingVisit.feedback,
      },
      include: visitInclude,
    });

    return cancelledVisit;
  } catch (error) {
    logger.error(`Error cancelling visit: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { cancelVisit };
