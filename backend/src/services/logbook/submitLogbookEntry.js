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

const submitLogbookEntry = async (logbookId, userId) => {
  try {
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            supervisorAssignments: {
              where: { status: "active" },
              include: {
                supervisor: {
                  select: {
                    id: true,
                    userId: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!logbook) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
    }

    if (logbook.status !== LOGBOOK_STATUS.DRAFT) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Logbook already submitted");
    }

    if (logbook.student.userId !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only submit your own logbook",
      );
    }

    const updated = await prisma.logbook.update({
      where: { id: logbookId },
      data: {
        status: LOGBOOK_STATUS.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        evidence: true,
        reviews: true,
        student: {
          include: { user: true },
        },
      },
    });

    const assignmentSupervisors = (logbook.student.supervisorAssignments || [])
      .map((assignment) => assignment.supervisor)
      .filter(Boolean);

    const industrialSupervisor = assignmentSupervisors.find(
      (supervisor) => supervisor.type === "industrial",
    );

    if (industrialSupervisor?.userId) {
      await notificationService.createNotification({
        recipientId: industrialSupervisor.userId,
        type: NOTIFICATION_TYPES.LOGBOOK_SUBMITTED,
        title: "New Logbook Submission",
        message: `${logbook.student.user.firstName} ${logbook.student.user.lastName} has submitted Week ${logbook.weekNumber} logbook`,
        priority: "medium",
        relatedModel: "Logbook",
        relatedId: logbookId,
        actionLink: "/i-supervisor/logbooks",
        actionText: "Review Logbook",
      });
    }

    logger.info(`Logbook submitted: ${logbookId}`);

    return updated;
  } catch (error) {
    logger.error(`Error submitting logbook: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { submitLogbookEntry };
