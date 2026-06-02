const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const updateAttendance = async (attendanceId, data) => {
  try {
    const existing = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!existing) {
      throw new ApiError(404, "Attendance record not found");
    }

    const allowedFields = [
      "checkInTime",
      "checkOutTime",
      "hoursWorked",
      "dayStatus",
      "approvalStatus",
      "punctuality",
      "absenceReason",
      "notes",
      "locationLatitude",
      "locationLongitude",
      "locationAddress",
      "distanceFromOffice",
      "supervisorComment",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, "No valid fields provided for update");
    }

    if (updateData.checkOutTime && updateData.checkInTime) {
      const checkIn = new Date(updateData.checkInTime).getTime();
      const checkOut = new Date(updateData.checkOutTime).getTime();
      if (checkOut <= checkIn) {
        throw new ApiError(400, "Check-out time must be after check-in time");
      }
      if (!updateData.hoursWorked) {
        updateData.hoursWorked = parseFloat(
          ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2),
        );
      }
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: updateData,
      include: {
        student: { include: { user: true } },
        placement: true,
        supervisor: { include: { user: true } },
      },
    });

    return updated;
  } catch (error) {
    logger.error(`Error updating attendance: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { updateAttendance };
