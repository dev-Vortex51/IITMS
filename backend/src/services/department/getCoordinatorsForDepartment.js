const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { USER_ROLES } = require("../../utils/constants");

const prisma = getPrismaClient();

const getCoordinatorsForDepartment = async (departmentId) => {
  try {
    const coordinators = await prisma.user.findMany({
      where: {
        role: USER_ROLES.COORDINATOR,
        isActive: true,
        OR: [{ departmentId: null }, { departmentId }],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        departmentId: true,
        faculty: {
          select: { name: true },
        },
        department: {
          select: { name: true },
        },
      },
    });

    return coordinators;
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getCoordinatorsForDepartment };
