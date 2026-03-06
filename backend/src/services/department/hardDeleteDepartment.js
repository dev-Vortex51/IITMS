const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const logger = require("../../utils/logger");

const prisma = getPrismaClient();

const hardDeleteDepartment = async (departmentId, user) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    if (department.isActive) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot permanently delete an active department. Deactivate it first.",
      );
    }

    const studentCount = await prisma.student.count({
      where: { departmentId },
    });

    if (studentCount > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot permanently delete department with associated students. Please transfer all students first.",
      );
    }

    await prisma.department.delete({
      where: { id: departmentId },
    });

    logger.info(
      `Department ${department.name} (${department.code}) permanently deleted by user ${user.email}`,
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { hardDeleteDepartment };
