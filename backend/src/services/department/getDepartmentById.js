const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");

const prisma = getPrismaClient();

const getDepartmentById = async (departmentId, user = null) => {
  try {
    if (user && user.role === USER_ROLES.COORDINATOR && user.departmentId) {
      if (user.departmentId !== departmentId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "Access denied. You can only view your own department.",
        );
      }
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: {
          select: { name: true, code: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        coordinators: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        _count: {
          select: {
            students: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    return {
      ...department,
      studentCount: department._count.students,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getDepartmentById };
