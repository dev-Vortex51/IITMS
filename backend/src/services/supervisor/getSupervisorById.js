const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");
const { transformSupervisor } = require("./transformSupervisor");

const prisma = getPrismaClient();

const getSupervisorById = async (supervisorId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
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
        assignedStudents: {
          include: {
            student: {
              select: {
                id: true,
                matricNumber: true,
                level: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const transformedSupervisor = transformSupervisor(supervisor);

    transformedSupervisor.students = supervisor.assignedStudents.map(
      (assignment) => ({
        id: assignment.student.id,
        matricNumber: assignment.student.matricNumber,
        level: assignment.student.level,
        name: `${assignment.student.user.firstName} ${assignment.student.user.lastName}`,
        email: assignment.student.user.email,
        assignmentId: assignment.id,
        assignmentStatus: assignment.status,
      }),
    );

    return transformedSupervisor;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { getSupervisorById };
