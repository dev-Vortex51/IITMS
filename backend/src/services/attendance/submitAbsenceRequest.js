const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { NOTIFICATION_TYPES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const { getLagosDayBounds, isDateWithinPlacementWindow } = require("./helpers");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const submitAbsenceRequest = async (studentId, date, reason) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        placements: {
          where: { status: "approved" },
          orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
          take: 1,
        },
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

    if (!student || student.placements.length === 0) {
      throw new ApiError(
        400,
        "You must have an approved placement to submit absence requests",
      );
    }

    const { startOfDay, endOfDay } = getLagosDayBounds(new Date(date));
    if (!isDateWithinPlacementWindow(startOfDay, student.placements[0])) {
      throw new ApiError(
        400,
        "Absence requests are only allowed within your approved placement dates.",
      );
    }

    let attendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (attendance && attendance.approvalStatus === "APPROVED") {
      throw new ApiError(
        400,
        "Cannot request absence for already approved attendance",
      );
    }

    if (attendance && attendance.checkInTime) {
      throw new ApiError(
        400,
        "Cannot request absence for a day you already checked in",
      );
    }

    if (attendance) {
      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          absenceReason: reason,
          dayStatus: "ABSENT",
          approvalStatus: "PENDING",
          punctuality: "LATE",
        },
        include: { student: { include: { user: true } }, placement: true },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          studentId,
          placementId: student.placements[0].id,
          date: startOfDay,
          absenceReason: reason,
          dayStatus: "ABSENT",
          approvalStatus: "PENDING",
          punctuality: "LATE",
          status: "absent",
        },
        include: { student: { include: { user: true } }, placement: true },
      });
    }

    const industrialSupervisorIds = [
      ...new Set(
        (student.supervisorAssignments || [])
          .filter((assignment) => assignment.supervisor?.type === "industrial")
          .map((assignment) => assignment.supervisor?.userId)
          .filter(Boolean),
      ),
    ];

    if (industrialSupervisorIds.length > 0) {
      await notificationService.createBulkNotifications(industrialSupervisorIds, {
        type: NOTIFICATION_TYPES.ABSENCE_REQUEST_SUBMITTED,
        title: "Absence Request Submitted",
        message: `${student.user.firstName} ${student.user.lastName} submitted an absence request.`,
        priority: "medium",
        relatedModel: "Attendance",
        relatedId: attendance.id,
        actionLink: "/i-supervisor/attendance",
        actionText: "Review Request",
      });
    }

    return attendance;
  } catch (error) {
    logger.error(`Error submitting absence request: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { submitAbsenceRequest };
