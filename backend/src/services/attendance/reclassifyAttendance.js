const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { NOTIFICATION_TYPES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const reclassifyAttendance = async (
  attendanceId,
  supervisorId,
  dayStatus,
  comment,
) => {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { student: true },
    });

    if (!attendance) {
      throw new ApiError(404, "Attendance record not found");
    }

    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: { assignedStudents: { select: { studentId: true } } },
    });

    if (!supervisor) {
      throw new ApiError(403, "Supervisor not found");
    }

    const isAssigned = supervisor.assignedStudents.some(
      (assignment) => assignment.studentId === attendance.student.id,
    );

    if (!isAssigned) {
      throw new ApiError(403, "You are not assigned to this student");
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        dayStatus,
        approvalStatus: "NEEDS_REVIEW",
        supervisorId: supervisor.id,
        supervisorApprovedAt: new Date(),
        supervisorComment: comment,
      },
      include: {
        student: { include: { user: true } },
        placement: true,
        supervisor: { include: { user: true } },
      },
    });

    const studentProfile = await prisma.student.findUnique({
      where: { id: attendance.student.id },
      select: { userId: true },
    });

    if (studentProfile?.userId) {
      await notificationService.createNotification({
        recipientId: studentProfile.userId,
        type: NOTIFICATION_TYPES.ATTENDANCE_RECLASSIFIED,
        title: "Attendance Reclassified",
        message: `Your attendance has been reclassified to ${dayStatus}.`,
        priority: "medium",
        relatedModel: "Attendance",
        relatedId: attendanceId,
      });
    }

    return updated;
  } catch (error) {
    logger.error(`Error reclassifying attendance: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { reclassifyAttendance };
