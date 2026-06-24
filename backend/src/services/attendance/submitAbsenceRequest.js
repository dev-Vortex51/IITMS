const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { NOTIFICATION_TYPES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const { getLagosDayBounds, isDateWithinPlacementWindow } = require("./helpers");
const notificationService = require("../notificationService");
const { notifyUser } = require("../../realtime/events");

const prisma = getPrismaClient();

const submitAbsenceRequest = async (studentId, startDate, endDate, reason) => {
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

    const dates = [];
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);
    const current = new Date(rangeStart);

    while (current <= rangeEnd) {
      const { startOfDay } = getLagosDayBounds(new Date(current));
      if (!isDateWithinPlacementWindow(startOfDay, student.placements[0])) {
        current.setDate(current.getDate() + 1);
        continue;
      }
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    if (dates.length === 0) {
      throw new ApiError(400, "No valid dates within your placement window.");
    }

    const created = [];

    for (const dateStr of dates) {
      const { startOfDay, endOfDay } = getLagosDayBounds(new Date(dateStr));

      let attendance = await prisma.attendance.findFirst({
        where: {
          studentId,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (attendance && attendance.approvalStatus === "APPROVED") continue;
      if (attendance && attendance.checkInTime) continue;

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
          },
          include: { student: { include: { user: true } }, placement: true },
        });
      }

      created.push(attendance);
    }

    const industrialSupervisorIds = [
      ...new Set(
        (student.supervisorAssignments || [])
          .filter((assignment) => assignment.supervisor?.type === "industrial")
          .map((assignment) => assignment.supervisor?.userId)
          .filter(Boolean),
      ),
    ];

    if (industrialSupervisorIds.length > 0 && created.length > 0) {
      await notificationService.createBulkNotifications(industrialSupervisorIds, {
        type: NOTIFICATION_TYPES.ABSENCE_REQUEST_SUBMITTED,
        title: "Absence Request Submitted",
        message: `${student.user.firstName} ${student.user.lastName} submitted an absence request for ${created.length} day(s).`,
        priority: "medium",
        relatedModel: "Attendance",
        relatedId: created[0].id,
        actionLink: "/i-supervisor/attendance",
        actionText: "Review Request",
      });

      industrialSupervisorIds.forEach((id) => {
        notifyUser(id, "attendance:absence_requested", {
          studentId,
          dates: created.map((a) => a.date),
          reason,
        });
      });
    }

    return created;
  } catch (error) {
    logger.error(`Error submitting absence request: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { submitAbsenceRequest };
