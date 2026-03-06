const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { NOTIFICATION_TYPES } = require("../../utils/constants");
const logger = require("../../utils/logger");
const { getDistance } = require("geolib");
const { getLagosDayBounds, isDateWithinPlacementWindow } = require("./helpers");
const notificationService = require("../notificationService");

const prisma = getPrismaClient();

const checkIn = async (studentId, data = {}) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        placements: {
          where: { status: "approved" },
          orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
          take: 1,
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

    const placement = student.placements[0];
    const { startOfDay, endOfDay, lagosTime } = getLagosDayBounds();
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

    let distanceFromOffice = null;
    if (placement.companyLat && placement.companyLng) {
      if (!data.location?.latitude || !data.location?.longitude) {
        throw new ApiError(400, "GPS location is required for check-in.");
      }

      distanceFromOffice = getDistance(
        {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        },
        { latitude: placement.companyLat, longitude: placement.companyLng },
      );

      const allowedRadius = placement.allowedRadius || 200;
      if (distanceFromOffice > allowedRadius) {
        throw new ApiError(
          403,
          `You are outside the acceptable radius. Distance: ${distanceFromOffice}m.`,
        );
      }
    }

    let punctuality = "ON_TIME";
    const workStartTime = placement.workStartTime || "08:00";
    const [targetHour, targetMinute] = workStartTime.split(":").map(Number);

    const currentHour = lagosTime.getHours();
    const currentMinute = lagosTime.getMinutes();

    if (
      currentHour > targetHour ||
      (currentHour === targetHour && currentMinute > targetMinute)
    ) {
      punctuality = "LATE";
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        placementId: placement.id,
        date: startOfDay,
        checkInTime: new Date(),
        locationAddress: data.location?.address || null,
        locationLatitude: data.location?.latitude,
        locationLongitude: data.location?.longitude,
        distanceFromOffice,
        notes: data.notes || "",
        dayStatus: "INCOMPLETE",
        approvalStatus: "PENDING",
        punctuality,
        status: "present",
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
    throw handlePrismaError(error);
  }
};

module.exports = { checkIn };
