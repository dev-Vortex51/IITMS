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
const userService = require("../userService");

const prisma = getPrismaClient();

const assignIndustrialSupervisor = async (
  placementId,
  supervisorData,
  assignerId,
) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: {
        student: true,
        industryPartner: true,
      },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    if (placement.status !== PLACEMENT_STATUS.APPROVED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Can only assign supervisor to approved placements",
      );
    }

    const partner = placement.industryPartner;
    const result = await userService.createIndustrialSupervisor(
      {
        ...supervisorData,
        companyName: partner?.name || placement.companyName,
        companyAddress: partner?.address || placement.companyAddress,
        companyEmail: partner?.email || placement.companyEmail,
        companyWebsite: partner?.website || placement.companyWebsite,
        companySector: partner?.sector || placement.companySector,
      },
      assignerId,
      placementId,
    );

    const { user, supervisor, requiresSetup, invitation } = result;

    if (requiresSetup) {
      logger.info(
        `Invitation sent to industrial supervisor: ${supervisorData.email}. Assignment will be completed after they accept.`,
      );

      try {
        await notificationService.createNotification({
          recipientId: placement.student.userId,
          type: NOTIFICATION_TYPES.INVITE_SENT,
          title: "Supervisor Invitation Sent",
          message: `An invitation has been sent to your industrial supervisor at ${supervisorData.email}. They will be assigned to you once they complete their account setup.`,
          priority: "medium",
          relatedModel: "Placement",
          relatedId: placementId,
          createdById: assignerId,
          sendEmail: false,
        });
      } catch (e) {
        logger.warn(`Failed to notify student: ${e.message}`);
      }

      return {
        success: true,
        message: "Invitation sent to industrial supervisor",
        invitation,
        pendingSetup: true,
      };
    }

    await prisma.placement.update({
      where: { id: placementId },
      data: { industrialSupervisorId: supervisor.id },
    });

    await prisma.student.update({
      where: { id: placement.studentId },
      data: { industrialSupervisorId: supervisor.id },
    });

    await prisma.supervisorAssignment.upsert({
      where: {
        studentId_supervisorId_placementId: {
          studentId: placement.studentId,
          supervisorId: supervisor.id,
          placementId: placementId,
        },
      },
      create: {
        studentId: placement.studentId,
        supervisorId: supervisor.id,
        placementId: placementId,
        status: "active",
      },
      update: {
        status: "active",
        assignedAt: new Date(),
        revokedAt: null,
      },
    });

    try {
      await notificationService.createNotification({
        recipientId: user.id,
        type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
        title: "Student Assigned",
        message: `You have been assigned as industrial supervisor for ${placement.student.id}`,
        priority: "high",
        createdById: assignerId,
        sendEmail: true,
      });
    } catch (e) {
      logger.warn(`Failed to notify supervisor: ${e.message}`);
    }

    try {
      await notificationService.createNotification({
        recipientId: placement.student.userId,
        type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
        title: "Supervisor Assigned",
        message: `${user.firstName} ${user.lastName} has been assigned as your industrial supervisor`,
        priority: "medium",
        createdById: assignerId,
      });
    } catch (e) {
      logger.warn(`Failed to notify student: ${e.message}`);
    }

    logger.info(`Industrial supervisor assigned to placement: ${placementId}`);

    return await prisma.placement.findUnique({ where: { id: placementId } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { assignIndustrialSupervisor };
