const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { visitInclude } = require("./helpers");

const prisma = getPrismaClient();

const createVisit = async (visitData, supervisorId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        assignedStudents: {
          where: { status: "active" },
          select: { studentId: true },
        },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const student = await prisma.student.findUnique({
      where: { id: visitData.student },
      select: { id: true, departmentId: true },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    const isAssigned = supervisor.assignedStudents.some(
      (assignment) => assignment.studentId === student.id,
    );

    if (!isAssigned) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You are not assigned to this student",
      );
    }

    const [settings, activeVisitCount] = await Promise.all([
      prisma.systemSettings.findFirst({
        select: { maxVisitations: true },
      }),
      prisma.visit.count({
        where: {
          studentId: student.id,
          status: { in: ["scheduled", "completed"] },
        },
      }),
    ]);

    const visitLimit =
      Number.isFinite(settings?.maxVisitations) && settings.maxVisitations > 0
        ? settings.maxVisitations
        : 2;

    if (activeVisitCount >= visitLimit) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Only ${visitLimit} visitations are allowed per student`,
      );
    }

    const activePlacement = await prisma.placement.findFirst({
      where: {
        studentId: student.id,
        status: "approved",
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    const createdVisit = await prisma.visit.create({
      data: {
        studentId: student.id,
        supervisorId,
        placementId: activePlacement?.id || null,
        visitDate: new Date(visitData.visitDate),
        type: visitData.type,
        objective: visitData.objective || null,
        location: visitData.location || null,
        feedback: visitData.feedback || null,
      },
      include: visitInclude,
    });

    return createdVisit;
  } catch (error) {
    logger.error(`Error creating visit: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { createVisit };
