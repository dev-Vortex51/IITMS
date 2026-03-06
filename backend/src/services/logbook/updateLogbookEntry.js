const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, LOGBOOK_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const updateLogbookEntry = async (logbookId, updateData, userId) => {
  try {
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
      include: { student: true },
    });

    if (!logbook) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
    }

    if (logbook.status !== LOGBOOK_STATUS.DRAFT) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot update submitted logbook",
      );
    }

    if (logbook.student.userId !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own logbook",
      );
    }

    const updated = await prisma.logbook.update({
      where: { id: logbookId },
      data: {
        tasksPerformed: updateData.tasksPerformed || logbook.tasksPerformed,
        skillsAcquired: updateData.skillsAcquired || logbook.skillsAcquired,
        challenges: updateData.challenges || logbook.challenges,
        lessonsLearned: updateData.lessonsLearned || logbook.lessonsLearned,
      },
      include: {
        evidence: true,
        reviews: true,
      },
    });

    logger.info(`Logbook updated: ${logbookId}`);

    return updated;
  } catch (error) {
    logger.error(`Error updating logbook: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { updateLogbookEntry };
