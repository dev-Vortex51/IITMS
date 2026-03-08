const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { reportInclude } = require("./helpers");

const prisma = getPrismaClient();

const reviewTechnicalReport = async (id, reviewData, user) => {
  try {
    const existing = await prisma.technicalReport.findUnique({
      where: { id },
      include: {
        student: {
          select: { departmentId: true },
        },
      },
    });

    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Final technical report not found");
    }

    const coordinatorDepartmentId = user.departmentId || user.department;
    if (
      user.role === USER_ROLES.COORDINATOR &&
      coordinatorDepartmentId &&
      existing.student?.departmentId !== coordinatorDepartmentId
    ) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    if (existing.status !== "submitted") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Only submitted reports can be reviewed",
      );
    }

    const reviewed = await prisma.technicalReport.update({
      where: { id },
      data: {
        status: reviewData.status,
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewComment: reviewData.reviewComment || null,
      },
      include: reportInclude,
    });

    return reviewed;
  } catch (error) {
    logger.error(`Error reviewing technical report: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { reviewTechnicalReport };
