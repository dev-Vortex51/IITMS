const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const {
  HTTP_STATUS,
  PLACEMENT_STATUS,
  NOTIFICATION_TYPES,
} = require("../../utils/constants");
const logger = require("../../utils/logger");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const withdrawPlacement = async (placementId, userId) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    if (placement.student.userId !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only withdraw your own placement",
      );
    }

    if (
      placement.status !== PLACEMENT_STATUS.PENDING &&
      placement.status !== PLACEMENT_STATUS.APPROVED
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot withdraw rejected or already withdrawn placements",
      );
    }

    const wasApproved = placement.status === PLACEMENT_STATUS.APPROVED;

    await prisma.placement.update({
      where: { id: placementId },
      data: { status: PLACEMENT_STATUS.WITHDRAWN },
    });

    if (wasApproved && placement.industrialSupervisorId) {
      await prisma.supervisorAssignment.updateMany({
        where: {
          studentId: placement.studentId,
          supervisorId: placement.industrialSupervisorId,
        },
        data: { status: "revoked", revokedAt: new Date() },
      });

      logger.info(
        `Unassigned industrial supervisor from student: ${placement.studentId}`,
      );
    }

    await prisma.student.update({
      where: { id: placement.studentId },
      data: {
        hasPlacement: false,
        placementApproved: false,
        currentPlacementId: null,
        industrialSupervisorId: null,
        trainingStartDate: null,
        trainingEndDate: null,
      },
    });

    const dept = await prisma.department.findUnique({
      where: { id: placement.student.departmentId },
      include: { coordinators: { select: { id: true } } },
    });

    if (dept && dept.coordinators.length > 0) {
      const studentName = `${placement.student.user.firstName} ${placement.student.user.lastName}`;
      await notificationService.createBulkNotifications(
        dept.coordinators.map((c) => c.id),
        {
          type: NOTIFICATION_TYPES.GENERAL,
          title: "Placement Withdrawn",
          message: `Student ${studentName} has withdrawn their placement application`,
          priority: "low",
          relatedModel: "Placement",
          relatedId: placement.id,
        },
      );
    }

    logger.info(`Placement withdrawn by student: ${placementId}`);

    return await prisma.placement.findUnique({ where: { id: placementId } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { withdrawPlacement };
