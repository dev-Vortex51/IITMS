const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { NOTIFICATION_TYPES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const { getDayBounds, isDateWithinPlacementWindow } = require("./helpers");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const checkIn = async (studentId, data) => {
  data = data || {};
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        placements: {
          where: { status: "approved" },
          orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
        },
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
        user: true,
      },
    });

    if (!student) throw new ApiError(404, "Student not found");

    if (student.placements.length === 0) {
      throw new ApiError(
        400,
        "You must have an approved placement to check in",
      );
    }

    let placement;
    if (student.placements.length === 1) {
      placement = student.placements[0];
    } else if (data.placementId) {
      placement = student.placements.find((p) => p.id === data.placementId);
      if (!placement) {
        throw new ApiError(400, "The specified placement was not found or is not approved.");
      }
    } else {
      throw new ApiError(
        400,
        "You have multiple approved placements. Please specify a placementId.",
      );
    }
    const placementTz = placement.timezone || "Africa/Lagos";
    const { startOfDay, endOfDay, zonedTime: lagosTime } = getDayBounds(new Date(), placementTz);
    if (!isDateWithinPlacementWindow(startOfDay, placement)) {
      throw new ApiError(
        400,
        "Attendance check-in is only allowed within your approved placement dates.",
      );
    }

    const existingCheckin = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existingCheckin && existingCheckin.checkInTime) {
      throw new ApiError(400, "You have already checked in today");
    }

    let punctuality = "ON_TIME";
    const workStartTime = placement.workStartTime || "08:00";
    const [targetHour, targetMinute] = workStartTime.split(":").map(Number);

    const graceMinutes = placement.gracePeriodMinutes ?? 15;
    let targetTotalMinutes = targetHour * 60 + targetMinute;
    targetTotalMinutes += graceMinutes;

    const currentTotalMinutes = lagosTime.getHours() * 60 + lagosTime.getMinutes();

    if (currentTotalMinutes > targetTotalMinutes) {
      punctuality = "LATE";
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        placementId: placement.id,
        date: startOfDay,
        checkInTime: new Date(),
        notes: data.notes || "",
        dayStatus: "INCOMPLETE",
        approvalStatus: "PENDING",
        punctuality,
      },
      include: {
        student: { include: { user: true } },
        placement: true,
      },
    });

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
        type: NOTIFICATION_TYPES.ATTENDANCE_CHECKED_IN,
        title: "Student Checked In",
        message: `${student.user.firstName} ${student.user.lastName} checked in for attendance.`,
        priority: "low",
        relatedModel: "Attendance",
        relatedId: attendance.id,
        actionLink: "/i-supervisor/attendance",
        actionText: "Review Attendance",
      });
    }

    return attendance;
  } catch (error) {
    logger.error(`Error checking in: ${error.message}`);
    if (error instanceof ApiError) throw error;
    throw handlePrismaError(error);
  }
};

module.exports = { checkIn };
