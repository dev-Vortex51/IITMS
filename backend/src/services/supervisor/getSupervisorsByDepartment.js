const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");

const prisma = getPrismaClient();

const getSupervisorsByDepartment = async (departmentId, type = null) => {
  try {
    const where = { departmentId, isActive: true };

    if (type) {
      where.type = type;
    }

    const supervisors = await prisma.supervisor.findMany({ where });

    return supervisors;
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getSupervisorsByDepartment };
