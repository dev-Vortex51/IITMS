const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { getLagosDayBounds } = require("./helpers");
const { notifyUser } = require("../../realtime/events");

const prisma = getPrismaClient();

const markAbsent = async (targetDate = null) => {
  try {
    let dateInput = targetDate ? new Date(targetDate) : new Date();
    if (!targetDate) {
      dateInput.setDate(dateInput.getDate() - 1);
    }

    const { startOfDay, endOfDay } = getLagosDayBounds(dateInput);

    const activeStudents = await prisma.student.findMany({
      where: { placementApproved: true, hasPlacement: true },
      include: {
        placements: {
          where: { status: "approved" },
          orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
          take: 1,
        },
      },
    });

    if (activeStudents.length === 0) return [];

    const studentIds = activeStudents.map((s) => s.id);

    const existingRecords = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: { gte: startOfDay, lte: endOfDay },
      },
      select: { studentId: true },
    });

    const studentsWithRecords = new Set(
      existingRecords.map((r) => r.studentId),
    );

    const absentData = [];
    for (const student of activeStudents) {
      if (
        !studentsWithRecords.has(student.id) &&
        student.placements.length > 0
      ) {
        absentData.push({
          studentId: student.id,
          placementId: student.placements[0].id,
          date: startOfDay,
          dayStatus: "ABSENT",
          approvalStatus: "PENDING",
        });
      }
    }

    if (absentData.length === 0) return [];

    const result = await prisma.attendance.createMany({ data: absentData });
    logger.info(
      `Created ${result.count} absent records for ${startOfDay.toISOString()}`,
    );

    const studentsWithUserIds = await prisma.student.findMany({
      where: { id: { in: absentData.map((a) => a.studentId) } },
      include: {
        user: { select: { id: true } },
        supervisorAssignments: {
          where: { status: "active" },
          include: { supervisor: { select: { userId: true } } },
        },
      },
    });

    studentsWithUserIds.forEach((student) => {
      if (student.user?.id) {
        notifyUser(student.user.id, "attendance:marked_absent", {
          date: startOfDay,
        });
      }
      const supervisorIds = student.supervisorAssignments
        .map((a) => a.supervisor?.userId)
        .filter(Boolean);
      supervisorIds.forEach((id) => {
        notifyUser(id, "attendance:marked_absent", {
          studentId: student.id,
          date: startOfDay,
        });
      });
    });

    return absentData;
  } catch (error) {
    logger.error(`Error marking absent: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { markAbsent };
