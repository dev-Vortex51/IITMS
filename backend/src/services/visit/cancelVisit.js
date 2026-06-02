const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, NOTIFICATION_TYPES } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { canManageVisit, visitInclude } = require("./helpers");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const cancelVisit = async (id, payload, user) => {
  try {
    const existingVisit = await prisma.visit.findUnique({
      where: { id },
      include: {
        student: {
          select: { departmentId: true, userId: true },
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

    const cancelNote = payload?.feedback || payload?.reason;
    if (!cancelNote) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "A cancellation reason is required",
      );
    }

    const cancelledVisit = await prisma.visit.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        feedback: cancelNote,
      },
      include: visitInclude,
    });

    if (existingVisit.student?.userId) {
      await notificationService.createNotification({
        recipientId: existingVisit.student.userId,
        type: NOTIFICATION_TYPES.GENERAL,
        title: "Visit Cancelled",
        message: `Your scheduled visit has been cancelled. Reason: ${cancelNote}`,
        priority: "high",
        relatedModel: "Visit",
        relatedId: id,
      });
    }

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
