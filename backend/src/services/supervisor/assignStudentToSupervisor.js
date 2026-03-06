const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, NOTIFICATION_TYPES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const assignStudentToSupervisor = async (supervisorId, studentId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: { assignedStudents: true, user: true },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const isAvailable =
      supervisor.assignedStudents.length < supervisor.maxStudents;
    if (!isAvailable) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Supervisor has reached maximum student capacity",
      );
    }

    await prisma.supervisorAssignment.upsert({
      where: {
        supervisorId_studentId: { supervisorId, studentId },
      },
      update: {},
      create: { supervisorId, studentId },
    });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (student?.userId) {
      await notificationService.createNotification({
        recipientId: student.userId,
        type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
        title: "Supervisor Assigned",
        message: `${supervisor.user?.firstName || "A supervisor"} has been assigned to you.`,
        priority: "medium",
        relatedModel: "SupervisorAssignment",
      });
    }

    if (supervisor?.userId) {
      await notificationService.createNotification({
        recipientId: supervisor.userId,
        type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
        title: "Student Assigned",
        message: `${student?.user?.firstName || "A student"} ${student?.user?.lastName || ""} was assigned to you.`,
        priority: "medium",
        relatedModel: "SupervisorAssignment",
      });
    }

    logger.info(`Student ${studentId} assigned to supervisor ${supervisorId}`);

    return supervisor;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { assignStudentToSupervisor };
