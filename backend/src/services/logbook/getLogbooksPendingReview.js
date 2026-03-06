const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, LOGBOOK_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getLogbooksPendingReview = async (supervisorId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        assignedStudents: {
          select: { studentId: true },
        },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const studentIds = supervisor.assignedStudents.map((s) => s.studentId);

    const where =
      supervisor.type === "industrial"
        ? {
            studentId: { in: studentIds },
            status: LOGBOOK_STATUS.SUBMITTED,
            reviews: {
              none: {
                supervisorId,
              },
            },
          }
        : {
            studentId: { in: studentIds },
            status: LOGBOOK_STATUS.REVIEWED,
            reviews: {
              none: {
                supervisorId,
              },
            },
          };

    const logbooks = await prisma.logbook.findMany({
      where,
      include: {
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
        evidence: true,
      },
    });

    return logbooks;
  } catch (error) {
    logger.error(`Error getting pending logbooks: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getLogbooksPendingReview };
