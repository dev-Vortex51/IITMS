const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { formInclude } = require("./helpers");

const prisma = getPrismaClient();

const getComplianceFormById = async (id, user) => {
  try {
    const form = await prisma.complianceForm.findUnique({
      where: { id },
      include: formInclude,
    });

    if (!form) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Compliance form not found");
    }

    if (user.role === USER_ROLES.STUDENT && form.studentId !== user.studentProfile) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    const coordinatorDepartmentId = user.departmentId || user.department;
    if (
      user.role === USER_ROLES.COORDINATOR &&
      coordinatorDepartmentId &&
      form.student?.departmentId !== coordinatorDepartmentId
    ) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    return form;
  } catch (error) {
    logger.error(`Error getting compliance form by id: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { getComplianceFormById };
