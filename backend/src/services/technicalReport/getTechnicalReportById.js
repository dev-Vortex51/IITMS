const { getPrismaClient } = require("../../config/prisma");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");
const { handlePrismaError } = require("../../utils/prismaErrors");
const logger = require("../../utils/logger");
const { reportInclude } = require("./helpers");

const prisma = getPrismaClient();

const getTechnicalReportById = async (id, user) => {
  try {
    const report = await prisma.technicalReport.findUnique({
      where: { id },
      include: reportInclude,
    });

    if (!report) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Final technical report not found");
    }

    if (user.role === USER_ROLES.STUDENT && report.studentId !== user.studentProfile) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    const coordinatorDepartmentId = user.departmentId || user.department;
    if (
      user.role === USER_ROLES.COORDINATOR &&
      coordinatorDepartmentId &&
      report.student?.departmentId !== coordinatorDepartmentId
    ) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    return report;
  } catch (error) {
    logger.error(`Error getting technical report by id: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = { getTechnicalReportById };
