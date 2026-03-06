const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const deleteDepartment = async (departmentId) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    const activeStudents = await prisma.student.count({
      where: {
        departmentId,
        isActive: true,
      },
    });

    if (activeStudents > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot delete department with active students. Please transfer or deactivate all students first.",
      );
    }

    const archivedCode = `${department.code}__deleted__${Date.now()}`;
    await prisma.department.update({
      where: { id: departmentId },
      data: {
        isActive: false,
        code: archivedCode,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { deleteDepartment };
