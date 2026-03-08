const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { reportInclude } = require("./helpers");

const prisma = getPrismaClient();

const submitTechnicalReport = async (id, studentId) => {
  try {
    const existing = await prisma.technicalReport.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        documentPath: true,
        status: true,
      },
    });

    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Final technical report not found");
    }

    if (existing.studentId !== studentId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    if (!existing.documentPath) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Attach your final technical report before submission",
      );
    }

    if (existing.status === "approved") {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Report already approved");
    }

    return prisma.technicalReport.update({
      where: { id },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
      include: reportInclude,
    });
  } catch (error) {
    logger.error(`Error submitting technical report: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { submitTechnicalReport };
