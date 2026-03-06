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

const reviewPlacement = async (placementId, reviewData, reviewerId) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: {
        student: { include: { user: true } },
        industryPartner: true,
      },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    if (placement.status !== PLACEMENT_STATUS.PENDING) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Placement has already been reviewed",
      );
    }

    const { status, reviewComment } = reviewData;

    if (status === PLACEMENT_STATUS.APPROVED) {
      await prisma.placement.update({
        where: { id: placementId },
        data: {
          status: PLACEMENT_STATUS.APPROVED,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          approvedAt: new Date(),
          rejectionReason: null,
        },
      });

      await prisma.student.update({
        where: { id: placement.studentId },
        data: {
          hasPlacement: true,
          placementApproved: true,
          currentPlacementId: placementId,
          trainingStartDate: placement.startDate,
          trainingEndDate: placement.endDate,
        },
      });

      const partner = placement.industryPartner;
      if (placement.supervisorEmail) {
        try {
          const supervisorResult = await userService.createIndustrialSupervisor(
            {
              email: placement.supervisorEmail,
              firstName:
                placement.supervisorName?.split(" ")[0] || "Supervisor",
              lastName:
                placement.supervisorName?.split(" ").slice(1).join(" ") || "",
              companyName: partner?.name || placement.companyName,
              companyAddress: partner?.address || placement.companyAddress,
              companyEmail: partner?.email || placement.companyEmail,
              companyWebsite: partner?.website || placement.companyWebsite,
              companySector: partner?.sector || placement.companySector,
              position: placement.supervisorPosition,
              phone: placement.supervisorPhone,
            },
            reviewerId,
            placementId,
          );

          const { supervisor, requiresSetup } = supervisorResult;

          if (requiresSetup) {
            logger.info(
              `Invitation sent to industrial supervisor: ${placement.supervisorEmail}`,
            );
          } else if (supervisor) {
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

            logger.info(
              `Industrial supervisor ${placement.supervisorEmail} assigned to placement ${placementId}`,
            );
          }
        } catch (supervisorError) {
          logger.error(
            `Failed to create/assign industrial supervisor: ${supervisorError.message}`,
          );
        }
      }

      await notificationService.createNotification({
        recipientId: placement.student.userId,
        type: NOTIFICATION_TYPES.PLACEMENT_APPROVED,
        title: "Placement Approved",
        message: `Your placement at ${
          partner?.name || placement.companyName
        } has been approved!`,
        priority: "high",
        relatedModel: "Placement",
        relatedId: placement.id,
        createdById: reviewerId,
        sendEmail: true,
      });

      logger.info(`Placement approved: ${placementId}`);
    } else {
      await prisma.placement.update({
        where: { id: placementId },
        data: {
          status: PLACEMENT_STATUS.REJECTED,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: reviewComment,
        },
      });

      await notificationService.createNotification({
        recipientId: placement.student.userId,
        type: NOTIFICATION_TYPES.PLACEMENT_REJECTED,
        title: "Placement Not Approved",
        message: `Your placement application was not approved. Reason: ${reviewComment}`,
        priority: "high",
        relatedModel: "Placement",
        relatedId: placement.id,
        createdById: reviewerId,
        sendEmail: true,
      });

      logger.info(`Placement rejected: ${placementId}`);
    }

    return await prisma.placement.findUnique({ where: { id: placementId } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { reviewPlacement };
