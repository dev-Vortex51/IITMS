const { getPrismaClient } = require("../../config/prisma");
const { handlePrismaError } = require("../../utils/prismaErrors");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const prisma = getPrismaClient();

const toggleDepartmentStatus = async (departmentId, user) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: { select: { name: true, code: true } },
      },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    const newStatus = !department.isActive;

    let updateData = {
      isActive: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus && department.code.includes("__deleted__")) {
      const originalCode = department.code.split("__deleted__")[0];
      updateData.code = originalCode;
    } else if (!newStatus) {
      const activeStudents = await prisma.student.count({
        where: { departmentId, isActive: true },
      });

      if (activeStudents > 0) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Cannot deactivate department with active students.",
        );
      }

      const archivedCode = `${department.code}__deleted__${Date.now()}`;
      updateData.code = archivedCode;
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: updateData,
      include: {
        faculty: { select: { name: true, code: true } },
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return updatedDepartment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = { toggleDepartmentStatus };
