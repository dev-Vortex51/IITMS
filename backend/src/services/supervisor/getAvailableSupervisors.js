const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { transformSupervisor } = require("./transformSupervisor");

const prisma = getPrismaClient();

const getAvailableSupervisors = async (type, departmentId = null) => {
  try {
    const where = { isActive: true };

    if (type === "departmental" || type === "academic") {
      where.type = { in: ["academic", "departmental"] };
    } else {
      where.type = type;
    }

    if (departmentId) {
      where.OR = [{ departmentId }, { departmentId: null }];
    }

    const supervisors = await prisma.supervisor.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        department: {
          select: { name: true, code: true },
        },
        industryPartner: {
          select: { name: true, address: true },
        },
        assignedStudents: true,
      },
    });

    const available = supervisors.filter(
      (s) => s.assignedStudents.length < s.maxStudents,
    );

    return available.map(transformSupervisor);
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getAvailableSupervisors };
