const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const logger = require("../../utils/logger");
const { getLagosDayBounds } = require("./helpers");

const prisma = getPrismaClient();

const checkOut = async (studentId, data = {}) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) throw new ApiError(404, "Student not found");

    const { startOfDay, endOfDay } = getLagosDayBounds();

    const attendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (!attendance)
      throw new ApiError(400, "You must check in before checking out");
    if (attendance.checkOutTime)
      throw new ApiError(400, "You have already checked out today");

    const now = new Date();
    if (now <= attendance.checkInTime) {
      throw new ApiError(400, "Check-out time must be after check-in time");
    }

    const hoursWorked =
      (now.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);

    let dayStatus = "PRESENT_ON_TIME";
    if (attendance.punctuality === "LATE") {
      dayStatus = "PRESENT_LATE";
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: now,
        hoursWorked: parseFloat(hoursWorked.toFixed(2)),
        dayStatus,
        notes: data.notes
          ? (attendance.notes || "") +
            (attendance.notes ? "\n" : "") +
            data.notes
          : attendance.notes,
      },
      include: {
        student: { include: { user: true } },
        placement: true,
      },
    });

    return updated;
  } catch (error) {
    logger.error(`Error checking out: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { checkOut };
