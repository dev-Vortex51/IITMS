const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../../utils/constants");

const prisma = getPrismaClient();

const assignCoordinator = async (departmentId, coordinatorId) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    const coordinator = await prisma.user.findUnique({
      where: { id: coordinatorId },
    });
    if (!coordinator) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Coordinator not found");
    }

    if (coordinator.role !== USER_ROLES.COORDINATOR) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User is not a coordinator");
    }

    if (coordinator.departmentId) {
      if (coordinator.departmentId !== departmentId) {
        const coordinatorDept = await prisma.department.findUnique({
          where: { id: coordinator.departmentId },
          select: { name: true },
        });
        const targetDept = await prisma.department.findUnique({
          where: { id: departmentId },
          select: { name: true },
        });

        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Coordinator ${coordinator.firstName} ${
            coordinator.lastName
          } belongs to ${
            coordinatorDept?.name || "another department"
          } and cannot be assigned to ${
            targetDept?.name || "this department"
          }. Coordinators can only be assigned to their own department.`,
        );
      }
    } else {
      await prisma.user.update({
        where: { id: coordinatorId },
        data: {
          department: { connect: { id: departmentId } },
          faculty: { connect: { id: department.facultyId } },
        },
      });
    }

    await prisma.user.update({
      where: { id: coordinatorId },
      data: {
        department: { connect: { id: departmentId } },
        faculty: { connect: { id: department.facultyId } },
      },
    });

    await prisma.department.update({
      where: { id: departmentId },
      data: {
        coordinators: { connect: { id: coordinatorId } },
        updatedAt: new Date(),
      },
    });

    const updatedDepartment = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: {
          select: { name: true, code: true },
        },
        coordinators: {
          select: { firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return updatedDepartment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { assignCoordinator };
