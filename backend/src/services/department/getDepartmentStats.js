const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const getDepartmentStats = async (departmentId) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    const [totalStudents, activeStudents] = await Promise.all([
      prisma.student.count({
        where: { departmentId },
      }),
      prisma.student.count({
        where: {
          departmentId,
          isActive: true,
        },
      }),
    ]);

    return {
      totalStudents,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents,
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getDepartmentStats };
