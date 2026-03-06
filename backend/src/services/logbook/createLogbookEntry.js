const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, LOGBOOK_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");
const { uploadToCloudinary } = require("../../utils/cloudinaryUpload");

const prisma = getPrismaClient();

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WEEK_IN_MS = 7 * DAY_IN_MS;

const getDerivedWeekContext = (placement) => {
  const placementStart = new Date(placement.startDate);
  placementStart.setHours(0, 0, 0, 0);

  const placementEnd = new Date(placement.endDate);
  placementEnd.setHours(23, 59, 59, 999);

  const now = new Date();

  if (now < placementStart) {
    return { error: "training_not_started" };
  }

  const referenceDate = now > placementEnd ? placementEnd : now;
  const diffFromStart = referenceDate.getTime() - placementStart.getTime();
  const weekNumber = Math.floor(diffFromStart / WEEK_IN_MS) + 1;

  const startDate = new Date(placementStart.getTime() + (weekNumber - 1) * WEEK_IN_MS);
  const endDateCandidate = new Date(startDate.getTime() + 6 * DAY_IN_MS);
  const endDate = endDateCandidate > placementEnd ? placementEnd : endDateCandidate;

  return { weekNumber, startDate, endDate };
};

const createLogbookEntry = async (studentId, logbookData, files = []) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        placements: {
          where: { status: "approved" },
          orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
          take: 1,
        },
      },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    if (student.placements.length === 0) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You cannot submit logbook. Ensure your placement is approved and training has started.",
      );
    }

    const activePlacement = student.placements[0];
    const weekContext = getDerivedWeekContext(activePlacement);
    if (weekContext.error === "training_not_started") {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Training has not started yet. Logbook entries can be created from your placement start date.",
      );
    }

    const { weekNumber, startDate, endDate } = weekContext;

    const existingLogbook = await prisma.logbook.findFirst({
      where: {
        studentId,
        weekNumber,
      },
    });

    if (existingLogbook) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Logbook for week ${weekNumber} already exists`,
      );
    }

    const uploadedEvidence = await Promise.all(
      (files || []).map(async (file) => {
        const result = await uploadToCloudinary(file, {
          folder: "iitms/logbooks/evidence",
        });

        return {
          name: file.originalname,
          path: result.url,
          type: file.mimetype,
        };
      }),
    );

    const logbook = await prisma.logbook.create({
      data: {
        studentId,
        weekNumber,
        startDate,
        endDate,
        tasksPerformed: logbookData.tasksPerformed,
        skillsAcquired: logbookData.skillsAcquired || "",
        challenges: logbookData.challenges || "",
        lessonsLearned: logbookData.lessonsLearned || "",
        status: LOGBOOK_STATUS.DRAFT,
        ...(uploadedEvidence.length > 0
          ? {
              evidence: {
                createMany: {
                  data: uploadedEvidence,
                },
              },
            }
          : {}),
      },
      include: {
        evidence: true,
        reviews: true,
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    logger.info(
      `Logbook entry created for student: ${student.id}, week: ${weekNumber}`,
    );

    return logbook;
  } catch (error) {
    logger.error(`Error creating logbook entry: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { createLogbookEntry };
