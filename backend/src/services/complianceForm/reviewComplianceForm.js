const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { formInclude, getComplianceFormDelegate } = require("./helpers");

const prisma = getPrismaClient();

const reviewComplianceForm = async (id, reviewData, user) => {
  try {
    const complianceForm = getComplianceFormDelegate(prisma);
    const existing = await complianceForm.findUnique({
      where: { id },
      include: {
        student: {
          select: { departmentId: true },
        },
      },
    });

    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Compliance form not found");
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
        "Only submitted forms can be reviewed",
      );
    }

    const nextStatus = reviewData.status;

    const reviewed = await complianceForm.update({
      where: { id },
      data: {
        status: nextStatus,
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewComment: reviewData.reviewComment || null,
      },
      include: formInclude,
    });

    return reviewed;
  } catch (error) {
    logger.error(`Error reviewing compliance form: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { reviewComplianceForm };
