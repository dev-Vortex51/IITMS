const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { NOTIFICATION_TYPES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const approveAttendance = async (attendanceId, supervisorId, comment = "") => {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { placement: true, student: true },
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
      (s) => s.studentId === attendance.student.id,
    );

    if (!isAssigned) {
      throw new ApiError(403, "You are not assigned to this student");
    }

    let dayStatus = attendance.dayStatus;
    if (dayStatus === "ABSENT" && attendance.absenceReason) {
      dayStatus = "EXCUSED_ABSENCE";
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        approvalStatus: "APPROVED",
        supervisorId: supervisor.id,
        supervisorApprovedAt: new Date(),
        supervisorComment: comment || attendance.supervisorComment,
        dayStatus,
      },
      include: {
        student: { include: { user: true } },
        placement: true,
        supervisor: { include: { user: true } },
      },
    });

    const student = await prisma.student.findUnique({
      where: { id: attendance.student.id },
      select: { userId: true },
    });

    if (student?.userId) {
      await notificationService.createNotification({
        recipientId: student.userId,
        type: NOTIFICATION_TYPES.ATTENDANCE_APPROVED,
        title: "Attendance Approved",
        message: "Your attendance request was approved.",
        priority: "medium",
        relatedModel: "Attendance",
        relatedId: attendanceId,
      });
    }

    return updated;
  } catch (error) {
    logger.error(`Error approving attendance: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { approveAttendance };
