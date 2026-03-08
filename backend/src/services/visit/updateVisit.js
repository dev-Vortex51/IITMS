const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { canManageVisit, visitInclude } = require("./helpers");

const prisma = getPrismaClient();

const updateVisit = async (id, visitData, user) => {
  try {
    const existingVisit = await prisma.visit.findUnique({
      where: { id },
      include: {
        student: {
          select: { departmentId: true },
        },
      },
    });

    if (!existingVisit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Visit record not found");
    }

    if (!canManageVisit(existingVisit, user)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to update this visit",
      );
    }

    const coordinatorDepartmentId = user.departmentId || user.department;
    if (
      user.role === "coordinator" &&
      coordinatorDepartmentId &&
      existingVisit.student?.departmentId !== coordinatorDepartmentId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have access to this department visit",
      );
    }

    if (existingVisit.status === "completed") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Completed visits cannot be updated",
      );
    }

    const data = {};
    if (visitData.visitDate) {
      data.visitDate = new Date(visitData.visitDate);
    }
    if (visitData.type) {
      data.type = visitData.type;
    }
    if (visitData.objective !== undefined) {
      data.objective = visitData.objective || null;
    }
    if (visitData.location !== undefined) {
      data.location = visitData.location || null;
    }
    if (visitData.feedback !== undefined) {
      data.feedback = visitData.feedback || null;
    }
    if (visitData.score !== undefined) {
      data.score = visitData.score;
    }

    const updatedVisit = await prisma.visit.update({
      where: { id },
      data,
      include: visitInclude,
    });

    return updatedVisit;
  } catch (error) {
    logger.error(`Error updating visit: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { updateVisit };
