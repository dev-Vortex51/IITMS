const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, NOTIFICATION_TYPES } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { visitInclude, validateVisitDate, checkDuplicateVisit } = require("./helpers");
const notificationService = require("../notificationService");
const { notifyUser } = require("../../realtime/events");

const prisma = getPrismaClient();

const createVisit = async (visitData, supervisorId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        assignedStudents: {
          where: { status: "active" },
          select: { studentId: true },
        },
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const student = await prisma.student.findUnique({
      where: { id: visitData.student },
      select: { id: true, departmentId: true, userId: true },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    const isAssigned = supervisor.assignedStudents.some(
      (assignment) => assignment.studentId === student.id,
    );

    if (!isAssigned) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You are not assigned to this student",
      );
    }

    const visitDate = new Date(visitData.visitDate);

    const [activeVisitCount, activePlacement] = await Promise.all([
      prisma.visit.count({
        where: {
          studentId: student.id,
          status: { in: ["scheduled", "completed"] },
        },
      }),
      prisma.placement.findFirst({
        where: { studentId: student.id, status: "approved" },
        orderBy: { createdAt: "desc" },
        select: { id: true, startDate: true, endDate: true, timezone: true },
      }),
    ]);

    const visitLimit = 2;

    if (activeVisitCount >= visitLimit) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Only ${visitLimit} visitations are allowed per student`,
      );
    }

    validateVisitDate(visitDate, activePlacement);
    await checkDuplicateVisit(prisma, student.id, visitDate);

    const createdVisit = await prisma.visit.create({
      data: {
        studentId: student.id,
        supervisorId,
        placementId: activePlacement?.id || null,
        timezone: activePlacement?.timezone || "Africa/Lagos",
        visitDate,
        type: visitData.type,
        objective: visitData.objective || null,
        location: visitData.location || null,
        feedback: visitData.feedback || null,
      },
      include: visitInclude,
    });

    if (student.userId) {
      await notificationService.createNotification({
        recipientId: student.userId,
        type: NOTIFICATION_TYPES.GENERAL,
        title: "Visit Scheduled",
        message: `A ${visitData.type} visit has been scheduled for you by ${supervisor.user.firstName} ${supervisor.user.lastName}.`,
        priority: "medium",
        relatedModel: "Visit",
        relatedId: createdVisit.id,
      });

      notifyUser(student.userId, "visit:created", {
        visitId: createdVisit.id,
        type: visitData.type,
        visitDate: visitData.visitDate,
      });
    }

    return createdVisit;
  } catch (error) {
    logger.error(`Error creating visit: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { createVisit };
