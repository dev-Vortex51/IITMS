const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const {
  HTTP_STATUS,
  LOGBOOK_STATUS,
  NOTIFICATION_TYPES,
} = require("../../utils/constants");
const logger = require("../../utils/logger");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const reviewLogbook = async (
  logbookId,
  reviewData,
  supervisorId,
  supervisorType,
) => {
  try {
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
      include: { student: true },
    });

    if (!logbook) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
    }

    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        assignedStudents: {
          select: { studentId: true },
        },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const isAssigned = supervisor.assignedStudents.some(
      (s) => s.studentId === logbook.studentId,
    );

    if (!isAssigned) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You are not assigned to this student",
      );
    }

    const existingReview = await prisma.logbookReview.findFirst({
      where: {
        logbookId,
        supervisorId,
      },
    });

    // Normalize supervisor type to the Prisma enum used by logbook reviews.
    const normalizedSupervisorType =
      supervisorType === "industrial"
        ? "industrial"
        : supervisorType === "departmental"
          ? "departmental"
          : "academic";

    if (existingReview) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "You have already reviewed this logbook",
      );
    }

    if (
      (normalizedSupervisorType === "departmental" ||
        normalizedSupervisorType === "academic") &&
      logbook.status !== LOGBOOK_STATUS.REVIEWED
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Departmental approval is only allowed after industrial review",
      );
    }

    if (normalizedSupervisorType === "industrial" && logbook.status !== LOGBOOK_STATUS.SUBMITTED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Logbook not ready for industrial review",
      );
    }

    const normalizedIncomingStatus = (reviewData.status || "").toLowerCase();
    let effectiveReviewStatus = LOGBOOK_STATUS.APPROVED;

    if (normalizedSupervisorType === "industrial") {
      if (
        normalizedIncomingStatus !== LOGBOOK_STATUS.REVIEWED &&
        normalizedIncomingStatus !== LOGBOOK_STATUS.REJECTED
      ) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Industrial review status must be either reviewed or rejected",
        );
      }
      effectiveReviewStatus = normalizedIncomingStatus;
    }

    if (
      normalizedSupervisorType === "departmental" ||
      normalizedSupervisorType === "academic"
    ) {
      if (
        normalizedIncomingStatus === LOGBOOK_STATUS.APPROVED ||
        normalizedIncomingStatus === LOGBOOK_STATUS.REJECTED
      ) {
        effectiveReviewStatus = normalizedIncomingStatus;
      } else {
        effectiveReviewStatus = LOGBOOK_STATUS.APPROVED;
      }
    }

    const reviewComment =
      typeof reviewData.comment === "string" && reviewData.comment.trim()
        ? reviewData.comment.trim()
        : normalizedSupervisorType === "industrial"
          ? effectiveReviewStatus === LOGBOOK_STATUS.REJECTED
            ? "Rejected by industrial supervisor"
            : "Reviewed by industrial supervisor"
          : "Approved by departmental supervisor";

    const review = await prisma.logbookReview.create({
      data: {
        logbookId,
        supervisorId,
        supervisorType: normalizedSupervisorType,
        comment: reviewComment,
        rating: reviewData.rating,
        status: effectiveReviewStatus,
      },
    });

    const roleStatusUpdate =
      normalizedSupervisorType === "industrial"
        ? {
            industrialReviewStatus: effectiveReviewStatus,
            industrialReviewedAt: new Date(),
          }
        : {
            departmentalReviewStatus: effectiveReviewStatus,
            departmentalReviewedAt: new Date(),
          };

    await prisma.logbook.update({
      where: { id: logbookId },
      data: {
        status:
          normalizedSupervisorType === "industrial"
            ? effectiveReviewStatus === LOGBOOK_STATUS.REJECTED
              ? LOGBOOK_STATUS.REJECTED
              : LOGBOOK_STATUS.REVIEWED
            : effectiveReviewStatus === LOGBOOK_STATUS.REJECTED
              ? LOGBOOK_STATUS.REJECTED
              : LOGBOOK_STATUS.APPROVED,
        ...roleStatusUpdate,
      },
    });

    const student = await prisma.student.findUnique({
      where: { id: logbook.studentId },
      include: {
        user: true,
        supervisorAssignments: {
          where: { status: "active" },
          include: {
            supervisor: {
              select: {
                userId: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (normalizedSupervisorType === "industrial") {
      if (effectiveReviewStatus === LOGBOOK_STATUS.REVIEWED) {
        await notificationService.createNotification({
          recipientId: student.userId,
          type: NOTIFICATION_TYPES.LOGBOOK_REVIEWED,
          title: "Logbook Reviewed",
          message: `Your Week ${logbook.weekNumber} logbook was reviewed by your industrial supervisor.`,
          priority: "medium",
          relatedModel: "Logbook",
          relatedId: logbookId,
        });

        const departmentalRecipientIds = [
          ...new Set(
            (student.supervisorAssignments || [])
              .filter((assignment) =>
                ["departmental", "academic"].includes(
                  assignment.supervisor?.type,
                ),
              )
              .map((assignment) => assignment.supervisor?.userId)
              .filter(Boolean),
          ),
        ];

        if (departmentalRecipientIds.length > 0) {
          await notificationService.createBulkNotifications(
            departmentalRecipientIds,
            {
              type: NOTIFICATION_TYPES.LOGBOOK_REVIEWED,
              title: "Logbook Ready For Final Approval",
              message: `${student.user.firstName} ${student.user.lastName} - Week ${logbook.weekNumber} is ready for departmental approval.`,
              priority: "medium",
              relatedModel: "Logbook",
              relatedId: logbookId,
              actionLink: "/d-supervisor/logbooks",
              actionText: "Approve Logbook",
            },
          );
        }
      } else {
        await notificationService.createNotification({
          recipientId: student.userId,
          type: NOTIFICATION_TYPES.LOGBOOK_REJECTED_BY_INDUSTRIAL,
          title: "Logbook Rejected",
          message: `Your Week ${logbook.weekNumber} logbook was rejected by your industrial supervisor.`,
          priority: "high",
          relatedModel: "Logbook",
          relatedId: logbookId,
        });
      }
    } else {
      await notificationService.createNotification({
        recipientId: student.userId,
        type:
          effectiveReviewStatus === LOGBOOK_STATUS.REJECTED
            ? NOTIFICATION_TYPES.LOGBOOK_REJECTED_FINAL
            : NOTIFICATION_TYPES.LOGBOOK_APPROVED_FINAL,
        title:
          effectiveReviewStatus === LOGBOOK_STATUS.REJECTED
            ? "Logbook Rejected"
            : "Logbook Approved",
        message:
          effectiveReviewStatus === LOGBOOK_STATUS.REJECTED
            ? `Your Week ${logbook.weekNumber} logbook was rejected by your departmental supervisor.`
            : `Your Week ${logbook.weekNumber} logbook was approved by your departmental supervisor.`,
        priority:
          effectiveReviewStatus === LOGBOOK_STATUS.REJECTED
            ? "high"
            : "medium",
        relatedModel: "Logbook",
        relatedId: logbookId,
      });
    }

    logger.info(
      `Logbook reviewed by ${supervisorType} supervisor: ${logbookId}`,
    );

    return review;
  } catch (error) {
    logger.error(`Error reviewing logbook: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { reviewLogbook };
