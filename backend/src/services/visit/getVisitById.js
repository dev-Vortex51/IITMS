const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { visitInclude } = require("./helpers");

const prisma = getPrismaClient();

const getVisitById = async (id, user) => {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id },
      include: visitInclude,
    });

    if (!visit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Visit record not found");
    }

    if (
      user.role === USER_ROLES.ACADEMIC_SUPERVISOR &&
      visit.supervisorId !== user.supervisorProfile
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have access to this visit",
      );
    }

    const coordinatorDepartmentId = user.departmentId || user.department;
    if (
      user.role === USER_ROLES.COORDINATOR &&
      coordinatorDepartmentId &&
      visit.student?.departmentId !== coordinatorDepartmentId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have access to this department visit",
      );
    }

    return visit;
  } catch (error) {
    logger.error(`Error getting visit by id: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { getVisitById };
