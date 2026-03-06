const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const getLogbookById = async (logbookId) => {
  try {
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        evidence: true,
        reviews: {
          include: {
            supervisor: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!logbook) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
    }

    return logbook;
  } catch (error) {
    logger.error(`Error getting logbook: ${error.message}`);
    throw handlePrismaError(error);
  }
};

module.exports = { getLogbookById };
