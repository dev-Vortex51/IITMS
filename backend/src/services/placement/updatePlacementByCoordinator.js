const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const {
  HTTP_STATUS,
  USER_ROLES,
  NOTIFICATION_TYPES,
} = require("../../utils/constants");
const logger = require("../../utils/logger");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const updatePlacementByCoordinator = async (placementId, updateData, user) => {
  try {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: {
        student: {
          include: { department: { include: { faculty: true } } },
        },
      },
    });

    if (!placement) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
    }

    if (updateData.departmentalSupervisor) {
      const supervisor = await prisma.supervisor.findUnique({
        where: { id: updateData.departmentalSupervisor },
        include: {
          user: true,
        },
      });

      if (!supervisor) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
      }

      if (supervisor.type !== "departmental" && supervisor.type !== "academic") {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Can only assign departmental supervisors through this endpoint",
        );
      }

      const maxStudents = supervisor.maxStudents || 5;
      const currentStudentCount = await prisma.supervisorAssignment.count({
        where: { supervisorId: supervisor.id, status: "active" },
      });

      const isAlreadyAssigned = await prisma.supervisorAssignment.findFirst({
        where: {
          studentId: placement.studentId,
          supervisorId: supervisor.id,
          status: "active",
        },
      });

      if (!isAlreadyAssigned && currentStudentCount >= maxStudents) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Supervisor has reached maximum capacity of ${maxStudents} students`,
        );
      }

      if (
        user.role === USER_ROLES.COORDINATOR &&
        placement.student.departmentId !== user.departmentId
      ) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "You can only assign supervisors to students in your department",
        );
      }

      await prisma.student.update({
        where: { id: placement.studentId },
        data: { departmentalSupervisorId: updateData.departmentalSupervisor },
      });

      if (!isAlreadyAssigned) {
        await prisma.supervisorAssignment.create({
          data: {
            studentId: placement.studentId,
            supervisorId: supervisor.id,
            status: "active",
          },
        });
      }

      logger.info(
        `Departmental supervisor assigned to student: ${placement.studentId}`,
      );

      const studentProfile = await prisma.student.findUnique({
        where: { id: placement.studentId },
        include: { user: true },
      });

      if (studentProfile?.userId) {
        await notificationService.createNotification({
          recipientId: studentProfile.userId,
          type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
          title: "Departmental Supervisor Assigned",
          message: `${supervisor.user?.firstName || "A supervisor"} ${supervisor.user?.lastName || ""} was assigned to your placement.`,
          priority: "medium",
          relatedModel: "Placement",
          relatedId: placementId,
          createdById: user.id,
        });
      }

      if (supervisor.userId) {
        await notificationService.createNotification({
          recipientId: supervisor.userId,
          type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
          title: "Student Assignment",
          message: `You were assigned to supervise a student placement.`,
          priority: "medium",
          relatedModel: "Placement",
          relatedId: placementId,
          createdById: user.id,
        });
      }
    }

    if (updateData.industrialSupervisor) {
      const supervisor = await prisma.supervisor.findUnique({
        where: { id: updateData.industrialSupervisor },
        include: {
          user: true,
        },
      });

      if (!supervisor) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
      }

      if (supervisor.type !== "industrial") {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Can only assign industrial supervisors through this endpoint",
        );
      }

      await prisma.placement.update({
        where: { id: placementId },
        data: { industrialSupervisorId: updateData.industrialSupervisor },
      });

      await prisma.student.update({
        where: { id: placement.studentId },
        data: { industrialSupervisorId: updateData.industrialSupervisor },
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
        update: { status: "active" },
      });

      logger.info(
        `Industrial supervisor assigned to student: ${placement.studentId}`,
      );

      const studentProfile = await prisma.student.findUnique({
        where: { id: placement.studentId },
        include: { user: true },
      });

      if (studentProfile?.userId) {
        await notificationService.createNotification({
          recipientId: studentProfile.userId,
          type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
          title: "Industrial Supervisor Assigned",
          message: `${supervisor.user?.firstName || "An industrial supervisor"} ${supervisor.user?.lastName || ""} was assigned to your placement.`,
          priority: "medium",
          relatedModel: "Placement",
          relatedId: placementId,
          createdById: user.id,
        });
      }

      if (supervisor.userId) {
        await notificationService.createNotification({
          recipientId: supervisor.userId,
          type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
          title: "Student Assignment",
          message: `You were assigned to supervise a student placement.`,
          priority: "medium",
          relatedModel: "Placement",
          relatedId: placementId,
          createdById: user.id,
        });
      }
    }

    return await prisma.placement.findUnique({
      where: { id: placementId },
      include: { industrialSupervisor: true },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { updatePlacementByCoordinator };
